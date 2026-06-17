// Prussian Bot — UI pa Prūsiskan
const I18N = {
  /* topbar */
  'topbar.subtitle': 'Rekōnstruīts Prūsisks · MCP-wirdeīns',
  'topbar.new': 'Nāuns',
  'topbar.settings': 'Ensadīnsenis',
  'topbar.settingsTitle': 'Ensadīnsen etwertun',
  'conn.notConfigured': 'Endpoint ensadīntun',
  'conn.working': 'dēlā …',
  'conn.mcpError': 'MCP-blānda',
  'conn.connecting': 'sensejja …',
  'conn.notConnected': 'MCP ni sensēts',

  /* welcome */
  'welcome.title': 'Prūsiskas Bots',
  'welcome.description': 'Chatbots, kas rekōnstruītun Prūsiskan bilāi — izmīnt Prūsiskas preidinsnan ir laukī wirdeīnan prei MCP-serveran, kāi si pa Prūsiskan etrātwei.',
  'welcome.notConfigured': 'Pirms endpoint ir MCP-serveran en Ensadīnsenis (wūnzai prei tikrai) sensētun.',
  'welcome.q1': 'Translate: "I have to go to the market tomorrow."',
  'welcome.q2': 'What does the Prussian word "wīdai" mean?',
  'welcome.q3': 'Dāis wīrdans prei seīlin be emōcijan!',

  /* user/bot labels */
  'user.label': 'tū',
  'bot.label': 'Prūsiskas Bots',

  /* composer */
  'composer.placeholder': 'Namestun — miksiskan, ēngliskan ar Prūsiskan …',
  'composer.placeholder.disabled': 'Pirms endpoint sensētun (Ensadīnsenis) …',
  'composer.send': 'Tenginnais',
  'composer.stop': 'Stalinnais',
  'composer.hint': '<b>Enter</b> tengīntun · <b>Shift+Enter</b> naunā rīndā',

  /* reasoning */
  'reasoning.head': 'Presnas',

  /* tool calls */
  'tool.args': 'Argumēnti',
  'tool.result': 'Rezultāts',
  'tool.error': 'Blānda',
  'tool.runningLabel': 'dēlā',
  'tool.running': 'Pagapts dēlā …',

  /* error card */
  'error.generic': 'Blānda',
  'error.rateLimit': 'Rāt-arāiks',
  'error.mcp': 'MCP-blānda',
  'error.llm': 'LLM-blānda',
  'error.retry': 'Etkūmps perbāndais',

  /* engine error messages */
  'error.network': 'tīnklan',
  'error.mcpUnreachable': 'MCP-server ni preiēimins',
  'error.mcpRateLimit': 'MCP-server: rāt-arāiks (429)',
  'error.mcp404': 'MCP-endpoint ni aupallīts (404) — URL perbāndātun',
  'error.mcpAuth': 'MCP-server: ni enwarīnts',
  'error.mcpHttp': 'MCP-server HTTP',
  'error.llmUnreachable': 'LLM-endpoint ni preiēimins',
  'error.llmRateLimit': 'LLM: rāt-arāiks (429)',
  'error.llmRateLimitSuffix': ' — madli īsai paliktwei.',
  'error.llmAuth': 'LLM: API-klaūtals inwalīdi ar nisātants',
  'error.llmPayment': 'LLM: ebplatīsnā būtewingi',
  'error.llm404': 'LLM: modelis ar endpoint ni aupallīts (404)',
  'error.llmServer': 'LLM: sērweris-blānda',
  'error.llmHttp': 'LLM HTTP',
  'tool.noResult': '(ni rezultātan)',

  /* thinking indicator */
  'thinking': 'mēri',

  /* settings drawer */
  'settings.title': 'Ensadīnsenis',
  'settings.model': 'Modelis',
  'settings.mcp': 'MCP-Sērweris',
  'settings.mcpUrl': 'Sērweris-URL (Streamable HTTP)',
  'mcp.refresh': 'Pagapten ernauninnais',
  'mcp.connect': 'Sensejjais',
  'mcp.connecting': 'sensejja …',
  'mcp.failed': 'niizpālts',
  'mcp.notConnected': 'ni sensēts',
  'settings.grammars': 'Grammatiki',
  'grammars.empty': 'Ni grammatikis resurssen prei sērweri preiēimins.',
  'settings.systemPrompt': 'Sistēmas-ēmpersin gērdausnā',
  'settings.systemPromptDesc': 'Pirzdau eraīnan sīndausnan.',
  'settings.reasoning': 'Presnas',
  'settings.thinking': 'Mēri aktīws',
  'settings.reasoningEffort': 'Presnas-pastanga',
  'effort.low': 'zems',
  'effort.medium': 'sirzds',
  'effort.high': 'auktums',
  'settings.reasoningEffortDesc': 'Ik twajs endpoint <code>reasoning_effort</code> enlaikā.',
  'settings.sampling': 'Samplingis-parāmeterai',
};

function t(key) {
  var entry = I18N[key];
  return entry != null ? entry : key;
}

Object.assign(window, { I18N, t });
