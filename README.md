# AI API Gateway

Unified API proxy for **OpenAI** and **Anthropic** models. Deploy on Vercel and use it as a single API endpoint for ChatGPT (GPT-4o, GPT-4, etc.) and Claude (Opus, Sonnet, Haiku) models.

## Features

- **Unified Endpoint**: Single `/api/chat` endpoint for all models
- **Auto Provider Detection**: Automatically routes to the correct provider based on model name
- **Streaming Support**: Full streaming support for real-time responses
- **CORS Enabled**: Use from any frontend application
- **Zero Dependencies**: Uses only Node.js built-in modules
- **Vercel Ready**: Deploys instantly on Vercel

## Supported Models

### OpenAI
`gpt-4o` · `gpt-4o-mini` · `gpt-4-turbo` · `gpt-4` · `gpt-3.5-turbo` · `o1` · `o1-mini` · `o3-mini`

### Anthropic
`claude-opus-4-20250514` · `claude-sonnet-4-20250514` · `claude-3-7-sonnet-20250219` · `claude-3-5-sonnet-20241022` · `claude-3-5-haiku-20241022` · `claude-3-opus-20240229` · `claude-3-sonnet-20240229` · `claude-3-haiku-20240307`

## Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aman262626/Api-source-)

Or manually:

```bash
npm i -g vercel
vercel
```

### 2. Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (`sk-...`) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |

### 3. Redeploy

After adding environment variables, redeploy the project for changes to take effect.

## API Reference

### POST `/api/chat`

Send a chat completion request.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY  (optional if env vars are set)
```

**Body:**
```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false,
  "temperature": 0.7
}
```

**Optional Fields:**
- `provider`: Force a specific provider (`"openai"` or `"anthropic"`)
- `stream`: Enable streaming responses (`true`/`false`)
- `temperature`: Control randomness (0-2)
- `max_tokens`: Maximum tokens in the response

### GET `/api/models`

List all supported models.

```bash
curl https://YOUR_DOMAIN/api/models
```

Filter by provider:
```bash
curl https://YOUR_DOMAIN/api/models?provider=openai
```

### GET `/api/health`

Check API status and provider configuration.

```bash
curl https://YOUR_DOMAIN/api/health
```

## Usage Examples

### cURL

```bash
curl -X POST https://YOUR_DOMAIN/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Write a hello world in Python"}]
  }'
```

### Python

```python
import requests

response = requests.post(
    "https://YOUR_DOMAIN/api/chat",
    json={
        "model": "claude-sonnet-4-20250514",
        "messages": [
            {"role": "user", "content": "Explain recursion"}
        ]
    }
)
print(response.json())
```

### JavaScript

```javascript
const response = await fetch("https://YOUR_DOMAIN/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello!" }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  process.stdout.write(decoder.decode(value));
}
```

### Using with OpenAI Python SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://YOUR_DOMAIN/api",
    api_key="your-openai-key"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

## Authentication

API keys can be provided in two ways:

1. **Environment Variables** (recommended): Set `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` in Vercel
2. **Authorization Header**: Pass the key per-request via `Authorization: Bearer <key>`

If both are set, the Authorization header takes priority.

## License

MIT
