// Prussian Bot — engine: MCP (Streamable HTTP) client, OpenAI-compatible
// streaming chat completions, and the helpers that glue them together.
// Plain logic, exposed on window for the React layer to drive.

/* ---- shared: read an SSE response body line-by-line ---- */
async function parseSSE(res, onData) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith('data:')) onData(line.slice(5).replace(/^ /, ''));
      // event:/id:/: comments are ignored — we key off the JSON payload
    }
  }
  buf = buf.trim();
  if (buf.startsWith('data:')) onData(buf.slice(5).trim());
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}

/* Stable per-tab session id — OpenCode requires x-opencode-session to route
   requests efficiently (caching). Persisted for the lifetime of the tab. */
function opencodeSessionId() {
  try {
    let id = sessionStorage.getItem('opencode-session');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID()
        : 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
      sessionStorage.setItem('opencode-session', id);
    }
    return id;
  } catch {
    return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }
}

/* A typed error so the UI can recognise rate limits etc. */
class ApiError extends Error {
  constructor(source, status, message) {
    super(message || t('error.' + source) + ' ' + status);
    this.source = source;            // 'llm' | 'mcp'
    this.status = status;            // HTTP status or JSON-RPC code
    this.isRateLimit = status === 429 || status === -32099;
  }
}

/* ============================================================
   MCP — Streamable HTTP transport
   ============================================================ */
class MCPClient {
  constructor(url) {
    this.url = (url || '').trim();
    this.sessionId = null;
    this.protocolVersion = '2025-06-18';
    this._id = 0;
    this.initialized = false;
  }

  _headers() {
    const h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (this.sessionId) h['Mcp-Session-Id'] = this.sessionId;
    if (this.initialized) h['MCP-Protocol-Version'] = this.protocolVersion;
    return h;
  }

  async _send(method, params, isNotification) {
    const reqId = isNotification ? undefined : ++this._id;
    const payload = { jsonrpc: '2.0', method };
    if (params !== undefined && params !== null) payload.params = params;
    if (!isNotification) payload.id = reqId;

    let res;
    try {
      res = await fetch(this.url, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify(payload),
      });
    } catch (e) {
      throw new ApiError('mcp', 0, t('error.mcpUnreachable') + ' (' + (e.message || t('error.network')) + ')');
    }

    const sid = res.headers.get('Mcp-Session-Id') || res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;

    if (!res.ok) {
      throw new ApiError('mcp', res.status, mcpHttpMessage(res.status, await safeText(res)));
    }
    if (isNotification || res.status === 202) return null;

    const ct = (res.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('text/event-stream')) {
      let result = null, errored = null;
      await parseSSE(res, (data) => {
        if (data === '[DONE]') return;
        let j; try { j = JSON.parse(data); } catch { return; }
        if (j.id === reqId) {
          if (j.error) errored = new ApiError('mcp', j.error.code || -1, j.error.message);
          else result = j.result;
        }
      });
      if (errored) throw errored;
      return result;
    }
    const j = await res.json();
    if (j.error) throw new ApiError('mcp', j.error.code || -1, j.error.message);
    return j.result;
  }

  async initialize() {
    const r = await this._send('initialize', {
      protocolVersion: this.protocolVersion,
      capabilities: {},
      clientInfo: { name: 'Prussian Bot', version: '1.0' },
    });
    if (r && r.protocolVersion) this.protocolVersion = r.protocolVersion;
    this.initialized = true;
    try { await this._send('notifications/initialized', null, true); } catch (_) {}
    return r;
  }

  async listTools() {
    if (!this.initialized) await this.initialize();
    const r = await this._send('tools/list', {});
    return (r && r.tools) || [];
  }

  async callTool(name, args) {
    if (!this.initialized) await this.initialize();
    return this._send('tools/call', { name, arguments: args || {} });
  }

  async listResources() {
    if (!this.initialized) await this.initialize();
    const r = await this._send('resources/list', {});
    return (r && r.resources) || [];
  }

  async readResource(uri) {
    if (!this.initialized) await this.initialize();
    const r = await this._send('resources/read', { uri });
    if (!r || !r.contents) return '';
    return r.contents.map((c) => c.text || '').join('\n').trim();
  }
}

function mcpHttpMessage(status, body) {
  if (status === 429) return t('error.mcpRateLimit');
  if (status === 404) return t('error.mcp404');
  if (status === 401 || status === 403) return t('error.mcpAuth') + ' (' + status + ')';
  const snip = (body || '').slice(0, 140);
  return t('error.mcpHttp') + ' ' + status + (snip ? ' — ' + snip : '');
}

/* MCP tool descriptors -> OpenAI tool schema */
function mcpToOpenAITools(tools) {
  return (tools || []).map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description || '',
      parameters: t.inputSchema || t.input_schema || { type: 'object', properties: {} },
    },
  }));
}

/* Flatten an MCP tool result into displayable text + error flag */
function readToolResult(result) {
  if (!result) return { text: '', isError: false };
  const parts = (result.content || []).map((c) => {
    if (c == null) return '';
    if (c.type === 'text') return c.text;
    if (c.type === 'resource' && c.resource) return c.resource.text || JSON.stringify(c.resource);
    return JSON.stringify(c, null, 2);
  });
  let text = parts.join('\n').trim();
  if (!text && result.structuredContent) text = JSON.stringify(result.structuredContent, null, 2);
  return { text, isError: !!result.isError };
}

/* ============================================================
   LLM — OpenAI-compatible streaming chat completions
   cbs: { onReasoning(full), onContent(full), onToolCalls(arr) }
   returns { content, reasoning, toolCalls:[{id,name,args}], finishReason }
   ============================================================ */
async function streamChat(cfg, apiMessages, signal, cbs) {
  const body = { model: cfg.model, messages: apiMessages, stream: true };
  if (cfg.tools && cfg.tools.length) { body.tools = cfg.tools; body.tool_choice = 'auto'; }
  if (cfg.temperature != null && cfg.temperature !== '') body.temperature = +cfg.temperature;
  if (cfg.maxTokens) body.max_tokens = +cfg.maxTokens;
  if (cfg.topP != null && cfg.topP !== '') body.top_p = +cfg.topP;
  if (cfg.thinking && cfg.reasoningEffort && cfg.reasoningEffort !== 'off') {
    body.reasoning_effort = cfg.reasoningEffort;
    body.reasoning = { effort: cfg.reasoningEffort };
  }

  let res;
  try {
    res = await fetch('api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-opencode-session': opencodeSessionId(),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
      throw new ApiError('llm', 0, t('error.llmUnreachable') + ' (' + (e.message || t('error.network')) + ')');
  }

  if (!res.ok) {
    throw new ApiError('llm', res.status, llmHttpMessage(res.status, await safeText(res)));
  }

  let content = '', reasoning = '', finishReason = null;
  let inThink = false, tail = '';
  const toolAcc = {};

  // route <think>…</think> content into reasoning when the model uses tags
  function feed(delta) {
    let s = tail + delta; tail = '';
    while (s) {
      if (!inThink) {
        const o = s.indexOf('<think>');
        if (o < 0) {
          if (/<\/?t?h?i?n?k?>?$/.test(s.slice(-7))) { tail = s; s = ''; }
          else { content += s; s = ''; }
        } else { content += s.slice(0, o); s = s.slice(o + 7); inThink = true; }
      } else {
        const c = s.indexOf('</think>');
        if (c < 0) {
          if (/<\/?t?h?i?n?k?>?$/.test(s.slice(-8))) { tail = s; s = ''; }
          else { reasoning += s; s = ''; }
        } else { reasoning += s.slice(0, c); s = s.slice(c + 8); inThink = false; }
      }
    }
  }

  await parseSSE(res, (data) => {
    if (data === '[DONE]') return;
    let j; try { j = JSON.parse(data); } catch { return; }
    const ch = j.choices && j.choices[0];
    if (!ch) return;
    const d = ch.delta || {};
    const rc = d.reasoning_content != null ? d.reasoning_content
             : (d.reasoning != null ? d.reasoning : null);
    if (rc) { reasoning += rc; cbs.onReasoning && cbs.onReasoning(reasoning); }
    if (d.content) { feed(d.content); cbs.onContent && cbs.onContent(content); if (reasoning) cbs.onReasoning && cbs.onReasoning(reasoning); }
    if (d.tool_calls) {
      for (const tc of d.tool_calls) {
        const i = tc.index != null ? tc.index : 0;
        const a = toolAcc[i] || (toolAcc[i] = { id: '', name: '', args: '' });
        if (tc.id) a.id = tc.id;
        if (tc.function && tc.function.name) a.name += tc.function.name;
        if (tc.function && tc.function.arguments) a.args += tc.function.arguments;
      }
      cbs.onToolCalls && cbs.onToolCalls(Object.values(toolAcc));
    }
    if (ch.finish_reason) finishReason = ch.finish_reason;
  });

  const toolCalls = Object.values(toolAcc).filter((t) => t.name);
  return { content, reasoning, toolCalls, finishReason };
}

function llmHttpMessage(status, body) {
  let detail = '';
  try { const j = JSON.parse(body); detail = (j.error && (j.error.message || j.error)) || ''; } catch { detail = (body || '').slice(0, 160); }
  if (status === 429) return t('error.llmRateLimit') + (detail ? ' — ' + detail : t('error.llmRateLimitSuffix'));
  if (status === 401 || status === 403) return t('error.llmAuth') + ' (' + status + ')' + (detail ? ' — ' + detail : '');
  if (status === 402) return t('error.llmPayment') + (detail ? ' — ' + detail : '');
  if (status === 404) return t('error.llm404');
  if (status >= 500) return t('error.llmServer') + ' (' + status + ')';
  return t('error.llmHttp') + ' ' + status + (detail ? ' — ' + detail : '');
}

Object.assign(window, {
  MCPClient, streamChat, mcpToOpenAITools, readToolResult, ApiError,
});
