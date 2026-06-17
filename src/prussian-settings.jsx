// Prussian Bot — settings drawer: connection, model, MCP, system prompt, params.
const { useState: useStateS } = React;

function Toggle({ on, onChange }) {
  return <div className={'tog' + (on ? ' on' : '')} onClick={() => onChange(!on)}><span className="knob" /></div>;
}

function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div className="fld slider-fld">
      <div className="top">
        <label>{label}</label>
        <span className="val">{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

const MODEL_SUGGESTIONS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
];

function SettingsDrawer({ cfg, setCfg, onClose, mcp }) {
  // mcp: { status, tools, error, connect }
  function set(k, v) { setCfg((c) => ({ ...c, [k]: v })); }

  const st = mcp.status;
  const statusCls = st === 'ok' ? 'ok' : st === 'connecting' ? 'busy' : st === 'error' ? 'err' : '';
  const statusTxt = st === 'ok' ? (mcp.tools.length + ' Werkzeug(e) verbunden')
    : st === 'connecting' ? 'verbinde …'
    : st === 'error' ? (mcp.error || 'Verbindung fehlgeschlagen')
    : 'nicht verbunden';

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-label="Einstellungen">
        <div className="drawer-head">
          <h2>Einstellungen</h2>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">

          {/* ---- Verbindung ---- */}
          <div className="sec">
            <h3>Endpoint <span className="ln" /></h3>
            <div className="fld">
              <label>OpenAI-kompatible Basis-URL</label>
              <input type="text" placeholder="https://dein-endpoint/v1" value={cfg.baseUrl}
                onChange={(e) => set('baseUrl', e.target.value)} />
              <div className="desc">Der Server stellt einen OpenAI-Endpoint bereit; <code>/chat/completions</code> wird angehängt.</div>
            </div>
            <div className="fld">
              <label>API-Key</label>
              <input type="password" placeholder="sk-… (leer lassen, wenn nicht nötig)" value={cfg.apiKey}
                onChange={(e) => set('apiKey', e.target.value)} />
            </div>
            <div className="fld">
              <label>Modell (Free-Tier)</label>
              <input type="text" list="model-suggest" placeholder="modell-id" value={cfg.model}
                onChange={(e) => set('model', e.target.value)} />
              <datalist id="model-suggest">
                {MODEL_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
              </datalist>
              <div className="desc">Modell-ID gemäß deinem Endpoint. Vorschläge sind nur Beispiele.</div>
            </div>
          </div>

          {/* ---- MCP ---- */}
          <div className="sec">
            <h3>MCP-Server <span className="ln" /></h3>
            <div className="fld">
              <label>Server-URL (Streamable HTTP)</label>
              <input type="text" placeholder="https://dein-mcp/mcp" value={cfg.mcpUrl}
                onChange={(e) => set('mcpUrl', e.target.value)} />
            </div>
            <div className={'mcp-status ' + statusCls}>
              <span className="led" /><span className="txt">{statusTxt}</span>
            </div>
            <div className="btn-line">
              <button className="iconbtn" onClick={() => mcp.connect(cfg.mcpUrl)} disabled={!cfg.mcpUrl || st === 'connecting'}>
                <span className="glyph">⇄</span>{st === 'ok' ? 'Werkzeuge aktualisieren' : 'Verbinden'}
              </button>
            </div>
            {mcp.tools.length > 0 && (
              <div className="toollist">
                {mcp.tools.map((t) => (
                  <div className="t" key={t.name}>
                    <div className="n">{t.name}</div>
                    {t.description && <div className="d">{t.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- Systemprompt ---- */}
          <div className="sec">
            <h3>Systemprompt <span className="ln" /></h3>
            <div className="fld">
              <textarea value={cfg.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} rows={5} />
              <div className="desc">Wird jeder Sitzung vorangestellt.</div>
            </div>
          </div>

          {/* ---- Reasoning ---- */}
          <div className="sec">
            <h3>Reasoning <span className="ln" /></h3>
            <div className="fld toggle-fld">
              <label>Thinking aktiv</label>
              <Toggle on={cfg.thinking} onChange={(v) => set('thinking', v)} />
            </div>
            {cfg.thinking && (
              <div className="fld">
                <label>Reasoning-Effort</label>
                <Segmented value={cfg.reasoningEffort} onChange={(v) => set('reasoningEffort', v)}
                  options={[{ value: 'low', label: 'niedrig' }, { value: 'medium', label: 'mittel' }, { value: 'high', label: 'hoch' }]} />
                <div className="desc">Sofern dein Endpoint <code>reasoning_effort</code> unterstützt.</div>
              </div>
            )}
          </div>

          {/* ---- Sampling-Parameter ---- */}
          <div className="sec">
            <h3>Sampling-Parameter <span className="ln" /></h3>
            <Slider label="Temperature" value={cfg.temperature} min={0} max={2} step={0.05}
              onChange={(v) => set('temperature', v)} fmt={(v) => v.toFixed(2)} />
            <Slider label="Top-p" value={cfg.topP} min={0} max={1} step={0.01}
              onChange={(v) => set('topP', v)} fmt={(v) => v.toFixed(2)} />
            <div className="fld">
              <label>Max tokens</label>
              <input type="number" min={64} max={32768} step={64} value={cfg.maxTokens}
                onChange={(e) => set('maxTokens', parseInt(e.target.value || '0', 10))} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

Object.assign(window, { SettingsDrawer, Toggle, Slider, Segmented });
