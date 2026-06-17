// Prussian Bot — settings drawer: connection, model, MCP, system prompt, params.
const { useState: useStateS } = React;

function Toggle({ on, onChange, disabled }) {
  return <div className={'tog' + (on ? ' on' : '') + (disabled ? ' dis' : '')} onClick={() => { if (!disabled) onChange(!on); }}><span className="knob" /></div>;
}

function Slider({ label, value, min, max, step, onChange, fmt, disabled }) {
  return (
    <div className="fld slider-fld">
      <div className="top">
        <label>{label}</label>
        <span className="val">{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Segmented({ options, value, onChange, disabled }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? 'on' : ''} onClick={() => { if (!disabled) onChange(o.value); }} disabled={disabled}>{o.label}</button>
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

function SettingsDrawer({ cfg, setCfg, onClose, mcp, resources }) {
  // mcp: { status, tools, error, connect }
  function set(k, v) { setCfg((c) => ({ ...c, [k]: v })); }

  const st = mcp.status;
  const statusCls = st === 'ok' ? 'ok' : st === 'connecting' ? 'busy' : st === 'error' ? 'err' : '';
  function statusTxt() {
    if (st === 'ok') { var n = mcp.tools.length; var d = (window.__lang || 'de') === 'de'; return n + (d ? ' Werkzeug' : ' tool') + (n === 1 ? '' : (d ? 'e' : 's')) + (d ? ' verbunden' : ' connected'); }
    if (st === 'connecting') return t('mcp.connecting');
    if (st === 'error') return mcp.error || t('mcp.failed');
    return t('mcp.notConnected');
  }

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-label={t('settings.title')}>
        <div className="drawer-head">
          <h2>{t('settings.title')}</h2>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">

          {/* ---- Verbindung ---- */}
          <div className="sec">
            <h3>{t('settings.model')} <span className="ln" /></h3>
            <div className="fld">
              <label>{t('settings.model')}</label>
              <input type="text" list="model-suggest" value={cfg.model}
                onChange={(e) => set('model', e.target.value)} />
              <datalist id="model-suggest">
                {MODEL_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
          </div>

          {/* ---- MCP ---- */}
          <div className="sec">
            <h3>{t('settings.mcp')} <span className="ln" /></h3>
            <div className="fld">
              <label>{t('settings.mcpUrl')}</label>
              <input type="text" value={cfg.mcpUrl}
                onChange={(e) => set('mcpUrl', e.target.value)} />
            </div>
            <div className={'mcp-status ' + statusCls}>
              <span className="led" /><span className="txt">{statusTxt()}</span>
            </div>
            <div className="btn-line">
              <button className="iconbtn" onClick={() => mcp.connect(cfg.mcpUrl)}>
                <span className="glyph">⇄</span>{st === 'ok' ? t('mcp.refresh') : t('mcp.connect')}
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

          {/* ---- Grammatiken ---- */}
          <div className="sec">
            <h3>{t('settings.grammars')} <span className="ln" /></h3>
            {(resources || []).length === 0 ? (
              <div className="desc" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>{t('grammars.empty')}</div>
            ) : (
              <div className="gramlist">
                {resources.map((r) => {
                  const sel = cfg.selectedGrammars || [];
                  const on = sel.includes(r.uri);
                  return (
                    <div key={r.uri} className={'gram-item' + (on ? ' on' : '')} onClick={() => {
                      const next = on ? sel.filter((u) => u !== r.uri) : sel.concat([r.uri]);
                      set('selectedGrammars', next);
                    }}>
                      <span className="check">{on ? '☑' : '☐'}</span>
                      <div className="gi-body">
                        <span className="gi-name">{r.name}</span>
                        {r.description && <span className="gi-desc">{r.description}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---- Systemprompt ---- */}
          <div className="sec">
            <h3>{t('settings.systemPrompt')} <span className="ln" /></h3>
            <div className="fld">
              <textarea value={cfg.systemPrompt != null ? cfg.systemPrompt : (PROMPTS[cfg.uiLang || 'de'] || PROMPTS['de']).system} onChange={(e) => set('systemPrompt', e.target.value)} rows={5} />
              <div className="desc">{t('settings.systemPromptDesc')}</div>
            </div>
          </div>

          {/* ---- Reasoning ---- */}
          <div className="sec">
            <h3>{t('settings.reasoning')} <span className="ln" /></h3>
            <div className="fld toggle-fld">
              <label>{t('settings.thinking')}</label>
              <Toggle on={cfg.thinking} onChange={(v) => set('thinking', v)} />
            </div>
            {cfg.thinking && (
              <div className="fld">
                <label>{t('settings.reasoningEffort')}</label>
                <Segmented value={cfg.reasoningEffort} onChange={(v) => set('reasoningEffort', v)}
                  options={[{ value: 'low', label: t('effort.low') }, { value: 'medium', label: t('effort.medium') }, { value: 'high', label: t('effort.high') }]} />
                <div className="desc" dangerouslySetInnerHTML={{__html: t('settings.reasoningEffortDesc')}} />
              </div>
            )}
          </div>

          {/* ---- Sampling-Parameter ---- */}
          <div className="sec">
            <h3>{t('settings.sampling')} <span className="ln" /></h3>
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
