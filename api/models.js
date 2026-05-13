const MODELS = {
  google: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Most capable Gemini model (FREE)" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast and smart (FREE)" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Fast multimodal model (FREE)" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", description: "Lightweight and fast (FREE)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Long context model (FREE)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Balanced speed and quality (FREE)" },
    { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B", description: "Smallest and fastest (FREE)" },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable OpenAI model" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "GPT-4 Turbo with vision" },
    { id: "gpt-4", name: "GPT-4", description: "Original GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and cost-effective" },
    { id: "o1", name: "o1", description: "Reasoning model" },
    { id: "o1-mini", name: "o1 Mini", description: "Fast reasoning model" },
    { id: "o3-mini", name: "o3 Mini", description: "Latest reasoning model" },
  ],
  anthropic: [
    { id: "claude-opus-4-20250514", name: "Claude Opus 4", description: "Most capable Claude model" },
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Best balance of speed and capability" },
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet", description: "Extended thinking support" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Fast and intelligent" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fastest Claude model" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most capable Claude 3" },
    { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced Claude 3" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast Claude 3" },
  ],
};

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const provider = req.query.provider;

  if (provider && MODELS[provider]) {
    return res.status(200).json({ provider, models: MODELS[provider] });
  }

  return res.status(200).json({
    providers: Object.keys(MODELS),
    models: MODELS,
    total: Object.values(MODELS).reduce((sum, arr) => sum + arr.length, 0),
  });
};
