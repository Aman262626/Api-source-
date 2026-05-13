const https = require("https");

const PROVIDER_CONFIG = {
  google: {
    host: "generativelanguage.googleapis.com",
    buildPath: (model, apiKey) =>
      `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    buildStreamPath: (model, apiKey) =>
      `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    envKey: "GEMINI_API_KEY",
    buildHeaders: () => ({
      "Content-Type": "application/json",
    }),
    buildBody: (body) => {
      const systemMessages = (body.messages || []).filter(
        (m) => m.role === "system"
      );
      const chatMessages = (body.messages || []).filter(
        (m) => m.role !== "system"
      );

      const contents = chatMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const payload = { contents };

      if (systemMessages.length > 0) {
        payload.systemInstruction = {
          parts: [{ text: systemMessages.map((m) => m.content).join("\n") }],
        };
      }

      const generationConfig = {};
      if (body.max_tokens) generationConfig.maxOutputTokens = body.max_tokens;
      if (body.temperature !== undefined)
        generationConfig.temperature = body.temperature;
      if (body.top_p !== undefined) generationConfig.topP = body.top_p;
      if (Object.keys(generationConfig).length > 0)
        payload.generationConfig = generationConfig;

      return JSON.stringify(payload);
    },
    transformResponse: (data) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.candidates && parsed.candidates[0]) {
          const candidate = parsed.candidates[0];
          const text =
            candidate.content &&
            candidate.content.parts &&
            candidate.content.parts[0]
              ? candidate.content.parts[0].text
              : "";
          return JSON.stringify({
            id: "gemini-" + Date.now(),
            object: "chat.completion",
            model: parsed.modelVersion || "gemini",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: text },
                finish_reason: candidate.finishReason || "stop",
              },
            ],
            usage: parsed.usageMetadata
              ? {
                  prompt_tokens: parsed.usageMetadata.promptTokenCount || 0,
                  completion_tokens:
                    parsed.usageMetadata.candidatesTokenCount || 0,
                  total_tokens: parsed.usageMetadata.totalTokenCount || 0,
                }
              : null,
          });
        }
        if (parsed.error) {
          return JSON.stringify({ error: parsed.error });
        }
        return data;
      } catch {
        return data;
      }
    },
    defaultModel: "gemini-2.0-flash",
  },
  openai: {
    host: "api.openai.com",
    path: "/v1/chat/completions",
    envKey: "OPENAI_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (body) => JSON.stringify(body),
    defaultModel: "gpt-4o",
  },
  anthropic: {
    host: "api.anthropic.com",
    path: "/v1/messages",
    envKey: "ANTHROPIC_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: (body) => {
      const systemMessages = (body.messages || []).filter(
        (m) => m.role === "system"
      );
      const nonSystemMessages = (body.messages || []).filter(
        (m) => m.role !== "system"
      );

      const payload = {
        model: body.model,
        max_tokens: body.max_tokens || 4096,
        messages: nonSystemMessages,
        stream: body.stream || false,
      };

      if (systemMessages.length > 0) {
        payload.system = systemMessages.map((m) => m.content).join("\n");
      }

      if (body.temperature !== undefined)
        payload.temperature = body.temperature;
      if (body.top_p !== undefined) payload.top_p = body.top_p;

      return JSON.stringify(payload);
    },
    defaultModel: "claude-sonnet-4-20250514",
  },
};

const MODEL_PROVIDER_MAP = {
  "gemini-2.5-pro": "google",
  "gemini-2.5-flash": "google",
  "gemini-2.0-flash": "google",
  "gemini-2.0-flash-lite": "google",
  "gemini-1.5-pro": "google",
  "gemini-1.5-flash": "google",
  "gemini-1.5-flash-8b": "google",
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-4-turbo": "openai",
  "gpt-4": "openai",
  "gpt-3.5-turbo": "openai",
  "o1": "openai",
  "o1-mini": "openai",
  "o1-preview": "openai",
  "o3-mini": "openai",
  "claude-sonnet-4-20250514": "anthropic",
  "claude-opus-4-20250514": "anthropic",
  "claude-3-7-sonnet-20250219": "anthropic",
  "claude-3-5-sonnet-20241022": "anthropic",
  "claude-3-5-haiku-20241022": "anthropic",
  "claude-3-opus-20240229": "anthropic",
  "claude-3-sonnet-20240229": "anthropic",
  "claude-3-haiku-20240307": "anthropic",
};

function detectProvider(model) {
  if (MODEL_PROVIDER_MAP[model]) return MODEL_PROVIDER_MAP[model];
  if (model.startsWith("gemini")) return "google";
  if (
    model.startsWith("gpt") ||
    model.startsWith("o1") ||
    model.startsWith("o3")
  )
    return "openai";
  if (model.startsWith("claude")) return "anthropic";
  return null;
}

function proxyGeminiRequest(config, apiKey, body, res) {
  const isStream = body.stream === true;
  const requestPath = isStream
    ? config.buildStreamPath(body.model, apiKey)
    : config.buildPath(body.model, apiKey);

  const payload = config.buildBody(body);

  const options = {
    hostname: config.host,
    port: 443,
    path: requestPath,
    method: "POST",
    headers: {
      ...config.buildHeaders(),
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    if (isStream) {
      res.writeHead(proxyRes.statusCode, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      proxyRes.pipe(res);
    } else {
      let data = "";
      proxyRes.on("data", (chunk) => {
        data += chunk;
      });
      proxyRes.on("end", () => {
        const transformed = config.transformResponse(data);
        res.writeHead(proxyRes.statusCode, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        });
        res.end(transformed);
      });
    }
  });

  proxyReq.on("error", (err) => {
    console.error("Gemini proxy error:", err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: {
          message: "Failed to connect to Gemini API",
          details: err.message,
        },
      });
    }
  });

  proxyReq.write(payload);
  proxyReq.end();
}

function proxyRequest(config, apiKey, body, res) {
  const payload = config.buildBody(body);

  const options = {
    hostname: config.host,
    port: 443,
    path: config.path,
    method: "POST",
    headers: {
      ...config.buildHeaders(apiKey),
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      "Content-Type": proxyRes.headers["content-type"] || "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy request error:", err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: {
          message: "Failed to connect to upstream API",
          details: err.message,
        },
      });
    }
  });

  proxyReq.write(payload);
  proxyReq.end();
}

module.exports = (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: { message: "Method not allowed. Use POST." } });
  }

  const authHeader = req.headers.authorization;
  const authToken = authHeader ? authHeader.replace("Bearer ", "") : null;

  const body = req.body;

  if (!body || !body.model) {
    return res.status(400).json({
      error: {
        message: "Missing required field: model",
        hint: "Provide a model name like 'gemini-2.0-flash' or 'gemini-2.5-pro'",
      },
    });
  }

  if (
    !body.messages ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    return res.status(400).json({
      error: {
        message: "Missing required field: messages",
        hint: "Provide an array of message objects with 'role' and 'content' fields",
      },
    });
  }

  const providerName = body.provider || detectProvider(body.model);

  if (!providerName || !PROVIDER_CONFIG[providerName]) {
    return res.status(400).json({
      error: {
        message: `Unknown model: ${body.model}`,
        hint: "Use a model like 'gemini-2.0-flash', 'gemini-2.5-pro', or specify 'provider' field",
        supported_models: Object.keys(MODEL_PROVIDER_MAP),
      },
    });
  }

  const config = PROVIDER_CONFIG[providerName];
  const apiKey = authToken || process.env[config.envKey];

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: `API key not found for provider: ${providerName}`,
        hint: `Set ${config.envKey} in Vercel environment variables, or pass it via Authorization: Bearer <key>`,
      },
    });
  }

  const requestBody = { ...body };
  delete requestBody.provider;

  if (providerName === "google") {
    proxyGeminiRequest(config, apiKey, requestBody, res);
  } else {
    proxyRequest(config, apiKey, requestBody, res);
  }
};
