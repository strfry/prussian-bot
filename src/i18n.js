// Prussian Bot — UI strings (English)
const I18N = {
  /* topbar */
  'topbar.subtitle': 'Reconstructed Old Prussian · MCP dictionary',
  'topbar.new': 'New',
  'topbar.settings': 'Settings',
  'topbar.settingsTitle': 'Open settings',
  'conn.notConfigured': 'Configure endpoint',
  'conn.working': 'working …',
  'conn.mcpError': 'MCP error',
  'conn.connecting': 'connecting …',
  'conn.notConnected': 'MCP not connected',
  'conn.toolConnected': 'tool connected',
  'conn.toolsConnected': 'tools connected',

  /* welcome */
  'welcome.title': 'Prūsisks Bōts',
  'welcome.description': 'A chatbot that reconstructs the Old Prussian language (Prūsiskan) — it uses Prussian grammar and looks words up in the dictionary on the MCP server to reply in Prussian.',
  'welcome.notConfigured': 'First configure an MCP server endpoint in Settings (top right).',
  'welcome.q1': 'Translate: "I have to go to the market tomorrow."',
  'welcome.q2': 'What does the Prussian word "wīdai" mean?',
  'welcome.q3': 'Give me a list of words about the soul and emotions',

  /* user/bot labels */
  'user.label': 'you',
  'bot.label': 'Prūsisks Bōts',

  /* composer */
  'composer.placeholder': 'Type a message — German, English, or Prussian …',
  'composer.placeholder.disabled': 'First connect an endpoint (Settings) …',
  'composer.send': 'Send',
  'composer.stop': 'Stop',
  'composer.hint': '<b>Enter</b> to send · <b>Shift+Enter</b> new line',

  /* reasoning */
  'reasoning.head': 'Reasoning',

  /* tool calls */
  'tool.args': 'Arguments',
  'tool.result': 'Result',
  'tool.error': 'Error',
  'tool.runningLabel': 'running',
  'tool.running': 'Tool running …',

  /* error card */
  'error.generic': 'Error',
  'error.rateLimit': 'Rate limit',
  'error.mcp': 'MCP error',
  'error.llm': 'LLM error',
  'error.retry': 'Try again',

  /* engine error messages */
  'error.network': 'network',
  'error.mcpUnreachable': 'MCP server unreachable',
  'error.mcpRateLimit': 'MCP server: rate limit (429)',
  'error.mcp404': 'MCP endpoint not found (404) — check the URL',
  'error.mcpAuth': 'MCP server: unauthorized',
  'error.mcpHttp': 'MCP server HTTP',
  'error.llmUnreachable': 'LLM endpoint unreachable',
  'error.llmRateLimit': 'LLM: rate limit (429)',
  'error.llmRateLimitSuffix': ' — please wait a moment.',
  'error.llmAuth': 'LLM: API key invalid or missing',
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
  'mcp.failed': 'failed',
  'mcp.notConnected': 'not connected',
  'settings.grammars': 'Grammars',
  'grammars.empty': 'No grammar resources available on the server.',
  'settings.systemPrompt': 'System prompt',
  'settings.systemPromptDesc': 'Prepended to every conversation.',
  'settings.reasoning': 'Reasoning',
  'settings.thinking': 'Thinking enabled',
  'settings.reasoningEffort': 'Reasoning effort',
  'effort.low': 'low',
  'effort.medium': 'medium',
  'effort.high': 'high',
  'settings.reasoningEffortDesc': 'If your endpoint supports <code>reasoning_effort</code>.',
  'settings.sampling': 'Sampling parameters',
};

function t(key) {
  var entry = I18N[key];
  return entry != null ? entry : key;
}

Object.assign(window, { I18N, t });
