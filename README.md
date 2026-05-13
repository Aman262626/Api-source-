# AI API Gateway

Unified API proxy for **Google Gemini** (FREE), **OpenAI**, and **Anthropic** models. Deploy on Vercel and use it as a single API endpoint.

## Google Gemini - FREE API Key

Google Gemini models are **completely free** to use. Get your free API key in 30 seconds:

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key - done!

**Available FREE models:** `gemini-2.5-pro` · `gemini-2.5-flash` · `gemini-2.0-flash` · `gemini-2.0-flash-lite` · `gemini-1.5-pro` · `gemini-1.5-flash` · `gemini-1.5-flash-8b`

## Features

- **Unified Endpoint**: Single `/api/chat` endpoint for all models
- **Auto Provider Detection**: Automatically routes to the correct provider based on model name
- **Streaming Support**: Full streaming support for real-time responses
- **OpenAI-Compatible Response Format**: Gemini responses are converted to OpenAI format
- **CORS Enabled**: Use from any frontend application
- **Zero Dependencies**: Uses only Node.js built-in modules
- **Vercel Ready**: Deploys instantly on Vercel

## Quick Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aman262626/Api-source-)

Or manually:

```bash
npm i -g vercel
vercel
```

### 2. Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Description | Free? |
|----------|-------------|-------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes - [Get free key](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | OpenAI API key (optional) | No |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | No |

### 3. Redeploy

After adding environment variables, redeploy the project for changes to take effect.

## API Reference

### POST `/api/chat`

Send a chat completion request.

**Body:**
```json
{
  "model": "gemini-2.0-flash",
  "messages": [
    { "role": "system", "content": "You are a helpful coding assistant." },
    { "role": "user", "content": "Write a Python function to sort a list" }
  ],
  "stream": false,
  "temperature": 0.7
}
```

**Optional Fields:**
- `provider`: Force a specific provider (`"google"`, `"openai"`, or `"anthropic"`)
- `stream`: Enable streaming responses (`true`/`false`)
- `temperature`: Control randomness (0-2)
- `max_tokens`: Maximum tokens in the response

### GET `/api/models`

List all supported models.

```bash
curl https://YOUR_DOMAIN/api/models
# Filter by provider
curl https://YOUR_DOMAIN/api/models?provider=google
```

### GET `/api/health`

Check API status and provider configuration.

## Usage Examples

### cURL (Gemini - FREE)

```bash
curl -X POST https://YOUR_DOMAIN/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Write hello world in Python"}]
  }'
```

### Python

```python
import requests

response = requests.post(
    "https://YOUR_DOMAIN/api/chat",
    json={
        "model": "gemini-2.5-pro",
        "messages": [
            {"role": "system", "content": "You are an expert coder."},
            {"role": "user", "content": "Build a REST API with FastAPI"}
        ]
    }
)
data = response.json()
print(data["choices"][0]["message"]["content"])
```

### JavaScript

```javascript
const response = await fetch("https://YOUR_DOMAIN/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gemini-2.0-flash",
    messages: [{ role: "user", content: "Write a React todo app" }]
  })
});
const data = await response.json();
console.log(data.choices[0].message.content);
```

## Supported Models

### Google Gemini (FREE)
`gemini-2.5-pro` · `gemini-2.5-flash` · `gemini-2.0-flash` · `gemini-2.0-flash-lite` · `gemini-1.5-pro` · `gemini-1.5-flash` · `gemini-1.5-flash-8b`

### OpenAI (Requires paid API key)
`gpt-4o` · `gpt-4o-mini` · `gpt-4-turbo` · `gpt-4` · `gpt-3.5-turbo` · `o1` · `o1-mini` · `o3-mini`

### Anthropic (Requires paid API key)
`claude-opus-4-20250514` · `claude-sonnet-4-20250514` · `claude-3-7-sonnet-20250219` · `claude-3-5-sonnet-20241022` · `claude-3-5-haiku-20241022` · `claude-3-opus-20240229` · `claude-3-sonnet-20240229` · `claude-3-haiku-20240307`

## Authentication

API keys can be provided in two ways:

1. **Environment Variables** (recommended): Set `GEMINI_API_KEY` (and optionally `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) in Vercel
2. **Authorization Header**: Pass the key per-request via `Authorization: Bearer <key>`

If both are set, the Authorization header takes priority.

## License

MIT
