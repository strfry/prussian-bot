// Prussian Bot — chat view: message list, reasoning block, tool cards, composer.
const { useState, useRef, useEffect, useLayoutEffect, useMemo } = React;

const MACRON = /[āēīōūĀĒĪŌŪ]/;
function Markdown({ text }) {
  const ref = useRef(null);
  const html = useMemo(() => text ? marked.parse(text) : '', [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const iter = document.createNodeIterator(el, NodeFilter.SHOW_TEXT, null);
    const pending = [];
    let node;
    while ((node = iter.nextNode())) {
      if (node.textContent && MACRON.test(node.textContent)) {
        pending.push(node);
      }
    }
    for (const n of pending) {
      const wrap = document.createElement('span');
      wrap.innerHTML = n.textContent.replace(/(\S*[āēīōūĀĒĪŌŪ]\S*)/g, '<span class="prussian">$1</span>');
      n.replaceWith(...wrap.childNodes);
    }
  }, [html]);

  if (!text) return null;
  return <div ref={ref} className="answer" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---- reasoning block (always visible, collapsible) ---- */
function Reasoning({ text, streaming }) {
  const [open, setOpen] = useState(true);
  if (!text) return null;
  return (
    <div className="reason">
      <div className={'reason-head' + (open ? '' : ' closed')} onClick={() => setOpen(!open)}>
        <span className="tw">▼</span>
        <span>{t('reasoning.head')}{streaming ? ' …' : ''}</span>
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
            <span className="k">{t('tool.args')}</span>
            <pre>{pretty(call.args)}</pre>
          </div>
          {status !== 'run' && (
            <div className={'kv' + (status === 'err' ? ' err' : '')}>
              <span className="k">{status === 'err' ? t('tool.error') : t('tool.result')}</span>
              <pre>{call.result != null ? call.result : (status === 'err' ? (call.error || t('tool.error')) : '…')}</pre>
            </div>
          )}
          {status === 'run' && <div className="kv"><span className="k">{t('tool.runningLabel')}</span><pre>{t('tool.running')}</pre></div>}
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
        <span className="et">{error.isRateLimit ? t('error.rateLimit') : (error.source === 'mcp' ? t('error.mcp') : t('error.generic'))}</span>
        <span className="msg-txt">{error.message}</span>
      </div>
      {onRetry && (
        <div className="actions">
          <button className="iconbtn" onClick={onRetry}><span className="glyph">↻</span>{t('error.retry')}</button>
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
        <div className="who">{t('user.label')}</div>
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
          <div className="bubble-bot">
            <Markdown text={turn.content} />
            {contentStreaming && <span className="caret" />}
          </div>
        ) : null}
        {turn.error ? <ErrorCard error={turn.error} onRetry={isLast ? onRetry : null} /> : null}
        {streaming && isLast && !turn.content && !turn.reasoning && calls.length === 0 && !turn.error && (
          <div className="bubble-bot answer" style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>
            {t('thinking')}<span className="dots" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- welcome / empty state ---- */
function Welcome({ onPick, configured }) {
  var welcomeQs = [
    { q: t('welcome.q1'), a: null },
    { q: t('welcome.q2'), a: null },
    { q: t('welcome.q3'), a: null },
  ];
  return (
    <div className="welcome">
      <h1><span className="prs">{t('welcome.title')}</span></h1>
      <p>{t('welcome.description')}</p>
      <div className="weave" />
      {!configured && <p style={{ color: 'var(--amber-deep)', fontStyle: 'italic' }}>
        {t('welcome.notConfigured')}
      </p>}
      <div className="suggests">
        {welcomeQs.map(function(item, i) {
          return (
            <button className="suggest" key={i} onClick={function() { onPick(item.q); }}>
              <span className="q">{item.q}</span>
              {item.a && <> → <span className="prs">{item.a}</span></>}
            </button>
          );
        })}
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
            placeholder={disabled ? t('composer.placeholder.disabled') : t('composer.placeholder')}
            onChange={(e) => setText(e.target.value)} onKeyDown={key} disabled={disabled}
          />
          {busy ? (
            <button className="sendbtn stop" onClick={onStop}><span>■</span>{t('composer.stop')}</button>
          ) : (
            <button className="sendbtn" onClick={submit} disabled={disabled || !text.trim()}>{t('composer.send')}<span>↩</span></button>
          )}
        </div>
        <div className="hint">
          <span dangerouslySetInnerHTML={{__html: t('composer.hint')}} />
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
