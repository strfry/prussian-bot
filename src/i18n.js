// Prussian Bot — i18n: DE / EN
const I18N = {
  de: {
    /* topbar */
    'topbar.subtitle': 'rekonstruiertes Altpreußisch · MCP-Wörterbuch',
    'topbar.new': 'Neu',
    'topbar.settings': 'Einstellungen',
    'topbar.settingsTitle': 'Einstellungen öffnen',
    'conn.notConfigured': 'Endpoint einrichten',
    'conn.working': 'arbeitet …',
    'conn.mcpError': 'MCP-Fehler',
    'conn.connecting': 'verbinde …',
    'conn.notConnected': 'MCP nicht verbunden',

    /* welcome */
    'welcome.title': 'Prūsiskas Bots',
    'welcome.description': 'Ein Chatbot, der die rekonstruierte altpreußische Sprache beherrscht — er entziffert prußische Eingaben und durchsucht das Wörterbuch über den MCP-Server, um selbst auf Prußisch zu antworten.',
    'welcome.notConfigured': 'Zunächst Endpoint & MCP-Server unter Einstellungen (oben rechts) verbinden.',
    'welcome.q1': 'Wie sagt man „Stern" auf Prußisch?',
    'welcome.q2': 'Übersetze: lāiku — was bedeutet das?',
    'welcome.q3': 'Bilde einen Gruß auf Altpreußisch.',

    /* user/bot labels */
    'user.label': 'du',
    'bot.label': 'Prūsiskas Bots',

    /* composer */
    'composer.placeholder': 'Frag etwas — auf Deutsch, Englisch oder Prūsiskan …',
    'composer.placeholder.disabled': 'Erst Endpoint verbinden (Einstellungen) …',
    'composer.send': 'Senden',
    'composer.stop': 'Stopp',
    'composer.hint': '<b>Enter</b> senden · <b>Shift+Enter</b> Zeilenumbruch',

    /* reasoning */
    'reasoning.head': 'Gedankengang',

    /* tool calls */
    'tool.args': 'Argument',
    'tool.result': 'Ergebnis',
    'tool.runningLabel': 'läuft',
    'tool.running': 'Werkzeug wird ausgeführt …',

    /* error card */
    'error.generic': 'Fehler',
    'error.rateLimit': 'Rate-Limit',
    'error.mcp': 'MCP-Fehler',
    'error.llm': 'LLM-Fehler',
    'error.retry': 'Erneut versuchen',

    /* engine error messages */
    'error.network': 'Netzwerk',
    'error.mcpUnreachable': 'MCP-Server nicht erreichbar',
    'error.mcpRateLimit': 'MCP-Server: Rate-Limit erreicht (429)',
    'error.mcp404': 'MCP-Endpoint nicht gefunden (404) — URL prüfen',
    'error.mcpAuth': 'MCP-Server: nicht autorisiert',
    'error.mcpHttp': 'MCP-Server HTTP',
    'error.llmUnreachable': 'LLM-Endpoint nicht erreichbar',
    'error.llmRateLimit': 'LLM: Rate-Limit erreicht (429)',
    'error.llmRateLimitSuffix': ' — bitte kurz warten.',
    'error.llmAuth': 'LLM: API-Key ungültig oder fehlend',
    'error.llmPayment': 'LLM: Zahlung erforderlich',
    'error.llm404': 'LLM: Modell oder Endpoint nicht gefunden (404)',
    'error.llmServer': 'LLM: Server-Fehler',
    'error.llmHttp': 'LLM HTTP',
    'tool.noResult': '(kein Ergebnis)',

    /* thinking indicator */
    'thinking': 'denkt nach',

    /* settings drawer */
    'settings.title': 'Einstellungen',
    'settings.model': 'Modell',
    'settings.mcp': 'MCP-Server',
    'settings.mcpUrl': 'Server-URL (Streamable HTTP)',
    'mcp.refresh': 'Werkzeuge aktualisieren',
    'mcp.connect': 'Verbinden',
    'mcp.connecting': 'verbinde …',
    'mcp.failed': 'Verbindung fehlgeschlagen',
    'mcp.notConnected': 'nicht verbunden',
    'settings.grammars': 'Grammatiken',
    'grammars.empty': 'Keine Grammatik-Ressourcen vom Server verfügbar.',
    'settings.systemPrompt': 'Systemprompt',
    'settings.systemPromptDesc': 'Wird jeder Sitzung vorangestellt.',
    'settings.reasoning': 'Reasoning',
    'settings.thinking': 'Thinking aktiv',
    'settings.reasoningEffort': 'Reasoning-Effort',
    'effort.low': 'niedrig',
    'effort.medium': 'mittel',
    'effort.high': 'hoch',
    'settings.reasoningEffortDesc': 'Sofern dein Endpoint <code>reasoning_effort</code> unterstützt.',
    'settings.sampling': 'Sampling-Parameter',
  },

  en: {
    /* topbar */
    'topbar.subtitle': 'reconstructed Old Prussian · MCP dictionary',
    'topbar.new': 'New',
    'topbar.settings': 'Settings',
    'topbar.settingsTitle': 'Open settings',
    'conn.notConfigured': 'Set up endpoint',
    'conn.working': 'working …',
    'conn.mcpError': 'MCP error',
    'conn.connecting': 'connecting …',
    'conn.notConnected': 'MCP not connected',

    /* welcome */
    'welcome.title': 'Prūsiskas Bots',
    'welcome.description': 'A chatbot that masters the reconstructed Old Prussian language — it deciphers Prussian input and searches the dictionary via the MCP server to answer in Prussian itself.',
    'welcome.notConfigured': 'First connect an endpoint & MCP server in Settings (top right).',
    'welcome.q1': 'How do you say "star" in Prussian?',
    'welcome.q2': 'Translate: lāiku — what does it mean?',
    'welcome.q3': 'Form a greeting in Old Prussian.',

    /* user/bot labels */
    'user.label': 'you',
    'bot.label': 'Prūsiskas Bots',

    /* composer */
    'composer.placeholder': 'Ask something — in German, English or Prūsiskan …',
    'composer.placeholder.disabled': 'Connect endpoint first (Settings) …',
    'composer.send': 'Send',
    'composer.stop': 'Stop',
    'composer.hint': '<b>Enter</b> to send · <b>Shift+Enter</b> new line',

    /* reasoning */
    'reasoning.head': 'Reasoning',

    /* tool calls */
    'tool.args': 'Arguments',
    'tool.result': 'Result',
    'tool.runningLabel': 'running',
    'tool.running': 'Running tool …',

    /* error card */
    'error.generic': 'Error',
    'error.rateLimit': 'Rate Limit',
    'error.mcp': 'MCP Error',
    'error.llm': 'LLM Error',
    'error.retry': 'Retry',

    /* engine error messages */
    'error.network': 'network',
    'error.mcpUnreachable': 'MCP server unreachable',
    'error.mcpRateLimit': 'MCP server: rate limit reached (429)',
    'error.mcp404': 'MCP endpoint not found (404) — check URL',
    'error.mcpAuth': 'MCP server: not authorized',
    'error.mcpHttp': 'MCP server HTTP',
    'error.llmUnreachable': 'LLM endpoint unreachable',
    'error.llmRateLimit': 'LLM: rate limit reached (429)',
    'error.llmRateLimitSuffix': ' — please wait a moment.',
    'error.llmAuth': 'LLM: invalid or missing API key',
    'error.llmPayment': 'LLM: payment required',
    'error.llm404': 'LLM: model or endpoint not found (404)',
    'error.llmServer': 'LLM: server error',
    'error.llmHttp': 'LLM HTTP',
    'tool.noResult': '(no result)',

    /* thinking indicator */
    'thinking': 'thinking',

    /* settings drawer */
    'settings.title': 'Settings',
    'settings.model': 'Model',
    'settings.mcp': 'MCP Server',
    'settings.mcpUrl': 'Server URL (Streamable HTTP)',
    'mcp.refresh': 'Refresh tools',
    'mcp.connect': 'Connect',
    'mcp.connecting': 'connecting …',
    'mcp.failed': 'Connection failed',
    'mcp.notConnected': 'not connected',
    'settings.grammars': 'Grammars',
    'grammars.empty': 'No grammar resources available from the server.',
    'settings.systemPrompt': 'System Prompt',
    'settings.systemPromptDesc': 'Prepended to every session.',
    'settings.reasoning': 'Reasoning',
    'settings.thinking': 'Thinking enabled',
    'settings.reasoningEffort': 'Reasoning Effort',
    'effort.low': 'low',
    'effort.medium': 'medium',
    'effort.high': 'high',
    'settings.reasoningEffortDesc': 'If your endpoint supports <code>reasoning_effort</code>.',
    'settings.sampling': 'Sampling Parameters',
  },
};

function t(key) {
  var lang = window.__lang || 'de';
  var entry = (I18N[lang] || I18N['de'])[key];
  return entry != null ? entry : key;
}

Object.assign(window, { I18N, t });
