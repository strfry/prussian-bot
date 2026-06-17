// Prussian Bot — chat view: message list, reasoning block, tool cards, composer.
const { useState, useRef, useEffect, useLayoutEffect } = React;

/* ---- tiny markdown -> React (bold/italic/code + paragraphs/lists) ---- */
const MACRON = /[āēīōūĀĒĪŌŪ]/;
function inlineMd(text, keyBase) {
  // split on **bold**, *italic*/_italic_, `code`
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...words(text.slice(last, m.index), keyBase + '-t' + (i++)));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<strong key={keyBase + '-b' + (i++)}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={keyBase + '-c' + (i++)}>{tok.slice(1, -1)}</code>);
    else out.push(<em key={keyBase + '-i' + (i++)}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(...words(text.slice(last), keyBase + '-t' + (i++)));
  return out;
}
// highlight Prussian-looking words (macron vowels) in amber
function words(text, keyBase) {
  const parts = text.split(/(\s+)/);
  return parts.map((w, j) =>
    MACRON.test(w) && /\p{L}/u.test(w)
      ? <span key={keyBase + '-' + j} className="prussian">{w}</span>
      : w
  );
}
function Markdown({ text }) {
  if (!text) return null;
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return blocks.map((blk, bi) => {
    const lines = blk.split('\n');
    const isUl = lines.every((l) => /^\s*[-*]\s+/.test(l));
    const isOl = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
    if (isUl && lines.length) return <ul key={bi}>{lines.map((l, li) => <li key={li}>{inlineMd(l.replace(/^\s*[-*]\s+/, ''), bi + '_' + li)}</li>)}</ul>;
    if (isOl && lines.length) return <ol key={bi}>{lines.map((l, li) => <li key={li}>{inlineMd(l.replace(/^\s*\d+[.)]\s+/, ''), bi + '_' + li)}</li>)}</ol>;
    return <p key={bi}>{lines.map((l, li) => [li > 0 && <br key={'br' + li} />, ...inlineMd(l, bi + '_' + li)])}</p>;
  });
}

/* ---- reasoning block (always visible, collapsible) ---- */
function Reasoning({ text, streaming }) {
  const [open, setOpen] = useState(true);
  if (!text) return null;
  return (
    <div className="reason">
      <div className={'reason-head' + (open ? '' : ' closed')} onClick={() => setOpen(!open)}>
        <span className="tw">▼</span>
        <span>Gedankengang{streaming ? ' …' : ''}</span>
      </div>
      {open && <div className="reason-body">{text}{streaming && <span className="caret" />}</div>}
    </div>
  );
}

/* ---- single tool call card ---- */
function ToolCard({ call }) {
  const [open, setOpen] = useState(false);
  const status = call.status || 'run'; // run | ok | err
  const led = status === 'ok' ? 'ok' : status === 'err' ? 'err' : 'run';
  let preview = call.args || '';
  try { if (call.args) preview = JSON.stringify(JSON.parse(call.args)); } catch (_) {}
  return (
    <div className={'toolcard' + (status === 'err' ? ' error' : '')}>
      <div className={'tool-head' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
        <span className="tw">▸</span>
        <span className="nm">{call.name}</span>
        <span className="preview">{preview}</span>
        <span className="stat">
          {call.ms != null && status !== 'run' && <span className="ms">{call.ms} ms</span>}
          <span className={'led-s ' + led} />
        </span>
      </div>
      {open && (
        <div className="tool-body">
          <div className="kv">
            <span className="k">Argument</span>
            <pre>{pretty(call.args)}</pre>
          </div>
          {status !== 'run' && (
            <div className={'kv' + (status === 'err' ? ' err' : '')}>
              <span className="k">{status === 'err' ? 'Fehler' : 'Ergebnis'}</span>
              <pre>{call.result != null ? call.result : (status === 'err' ? (call.error || 'Fehler') : '…')}</pre>
            </div>
          )}
          {status === 'run' && <div className="kv"><span className="k">läuft</span><pre>Werkzeug wird ausgeführt …</pre></div>}
        </div>
      )}
    </div>
  );
}
function pretty(s) {
  if (s == null || s === '') return '{}';
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}

/* ---- error card with retry ---- */
function ErrorCard({ error, onRetry }) {
  return (
    <div className="errcard">
      <div className="hd">
        <span className="et">{error.isRateLimit ? 'Rate-Limit' : (error.source === 'mcp' ? 'MCP-Fehler' : 'Fehler')}</span>
        <span className="msg-txt">{error.message}</span>
      </div>
      {onRetry && (
        <div className="actions">
          <button className="iconbtn" onClick={onRetry}><span className="glyph">↻</span>Erneut versuchen</button>
        </div>
      )}
    </div>
  );
}

/* ---- one message (user or assistant) ---- */
function Message({ turn, isLast, streaming, onRetry }) {
  if (turn.role === 'user') {
    return (
      <div className="msg user">
        <div className="who">du</div>
        <div className="bubble-user">{turn.content}</div>
      </div>
    );
  }
  const calls = turn.toolCalls || [];
  const reasoningStreaming = streaming && isLast && !turn.content && !turn.error;
  const contentStreaming = streaming && isLast && !!turn.content;
  return (
    <div className="msg bot">
      <div className="who">Prūsiskas Bots</div>
      <div className="bot-stack">
        {turn.reasoning ? <Reasoning text={turn.reasoning} streaming={reasoningStreaming} /> : null}
        {calls.length > 0 && (
          <div className="tools">
            {calls.map((c, i) => <ToolCard key={c.id || i} call={c} />)}
          </div>
        )}
        {turn.content ? (
          <div className="bubble-bot answer">
            <Markdown text={turn.content} />
            {contentStreaming && <span className="caret" />}
          </div>
        ) : null}
        {turn.error ? <ErrorCard error={turn.error} onRetry={isLast ? onRetry : null} /> : null}
        {streaming && isLast && !turn.content && !turn.reasoning && calls.length === 0 && !turn.error && (
          <div className="bubble-bot answer" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>
            denkt nach<span className="dots" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- welcome / empty state ---- */
function Welcome({ onPick, configured }) {
  const qs = [
    ['Wie sagt man „Stern" auf Prußisch?', 'lāuksnā'],
    ['Übersetze: lāiku — was bedeutet das?', null],
    ['Bilde einen Gruß auf Altpreußisch.', null],
  ];
  return (
    <div className="welcome">
      <h1><span className="prs">Prūsiskas</span> Bots</h1>
      <p>Ein Chatbot, der die rekonstruierte altpreußische Sprache beherrscht — er entziffert prußische Eingaben und durchsucht das Wörterbuch über den MCP-Server, um selbst auf Prußisch zu antworten.</p>
      <div className="weave" />
      {!configured && <p style={{ color: 'var(--amber-deep)', fontStyle: 'italic' }}>Zunächst Endpoint &amp; MCP-Server unter <b>Einstellungen</b> (oben rechts) verbinden.</p>}
      <div className="suggests">
        {qs.map(([q, a], i) => (
          <button className="suggest" key={i} onClick={() => onPick(q)}>
            <span className="q">{q}</span>
            {a && <> → <span className="prs">{a}</span></>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- composer ---- */
function Composer({ onSend, busy, onStop, disabled }) {
  const [text, setText] = useState('');
  const ref = useRef(null);
  function grow() {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }
  useEffect(grow, [text]);
  function submit() {
    const t = text.trim(); if (!t || busy) return;
    onSend(t); setText('');
  }
  function key(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }
  return (
    <div className="composer-wrap">
      <div className="composer">
        <div className="row">
          <textarea
            ref={ref} value={text} rows={1}
            placeholder={disabled ? 'Erst Endpoint verbinden (Einstellungen) …' : 'Frag etwas — auf Deutsch, Englisch oder Prūsiskan …'}
            onChange={(e) => setText(e.target.value)} onKeyDown={key} disabled={disabled}
          />
          {busy ? (
            <button className="sendbtn stop" onClick={onStop}><span>■</span>Stopp</button>
          ) : (
            <button className="sendbtn" onClick={submit} disabled={disabled || !text.trim()}>Senden<span>↩</span></button>
          )}
        </div>
        <div className="hint">
          <span><b>Enter</b> senden · <b>Shift+Enter</b> Zeilenumbruch</span>
        </div>
      </div>
    </div>
  );
}

/* keep thread pinned to bottom while streaming */
function useStickyScroll(ref, dep) {
  const stick = useRef(true);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => { stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  useLayoutEffect(() => {
    const el = ref.current; if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [dep]);
}

Object.assign(window, { Markdown, Reasoning, ToolCard, ErrorCard, Message, Welcome, Composer, useStickyScroll });
