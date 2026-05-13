import os
import json
import requests
from http.server import BaseHTTPRequestHandler

TOKEN = os.environ.get("BOT_TOKEN", "")
VERCEL_URL = os.environ.get("VERCEL_URL", "")


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not TOKEN:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": "BOT_TOKEN not set in environment variables"}).encode()
            )
            return

        webhook_url = f"https://{VERCEL_URL}/api/webhook"
        telegram_url = f"https://api.telegram.org/bot{TOKEN}/setWebhook?url={webhook_url}"

        response = requests.get(telegram_url)
        result = response.json()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(
            json.dumps(
                {
                    "webhook_url": webhook_url,
                    "telegram_response": result,
                }
            ).encode()
        )
