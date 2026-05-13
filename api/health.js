module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    providers: {
      google: { configured: hasGemini, free: true },
      openai: { configured: hasOpenAI, free: false },
      anthropic: { configured: hasAnthropic, free: false },
    },
    version: "2.0.0",
  });
};
