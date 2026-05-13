module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    providers: {
      openai: { configured: hasOpenAI },
      anthropic: { configured: hasAnthropic },
    },
    version: "1.0.0",
  });
};
