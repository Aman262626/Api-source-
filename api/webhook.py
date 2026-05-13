import os
import json
import telebot
import requests
from http.server import BaseHTTPRequestHandler

TOKEN = os.environ.get("BOT_TOKEN", "")
API_URL = "https://nggemini.tiiny.io/?prompt="

bot = telebot.TeleBot(TOKEN)


@bot.message_handler(commands=["start"])
def start(message):
    text = "👋 Welcome! Use the following commands:\n\n"
    text += "🔹 /ask <question> - Get AI-generated response\n"
    text += "🔹 /help - Get support\n"
    text += "🔹 /admin - Contact Admin\n"
    text += "🔹 /live - View live members count"
    bot.send_message(message.chat.id, text)


@bot.message_handler(commands=["ask"])
def ask(message):
    query = message.text.replace("/ask", "").strip()
    if not query:
        bot.send_message(message.chat.id, "❌ Please enter a question after /ask")
        return

    try:
        response = requests.get(API_URL + query, timeout=30)
        bot.send_message(message.chat.id, "🤖 AI Response:\n" + response.text)
    except Exception as e:
        bot.send_message(message.chat.id, "❌ Error getting response. Try again.")


@bot.message_handler(commands=["help"])
def help_command(message):
    text = "Need help? Click below to DM me 👇"
    keyboard = telebot.types.InlineKeyboardMarkup()
    keyboard.add(
        telebot.types.InlineKeyboardButton(
            "💬 Contact Developer", url="https://t.me/NGYT777GG"
        )
    )
    bot.send_message(message.chat.id, text, reply_markup=keyboard)


@bot.message_handler(commands=["admin"])
def admin(message):
    bot.send_message(message.chat.id, "👤 Admin: @GOAT_NG")


@bot.message_handler(commands=["live"])
def live(message):
    try:
        bot_info = bot.get_me()
        chat_info = bot.get_chat(bot_info.id)
        bot.send_message(
            message.chat.id, f"📊 Total Members: {chat_info.members_count}"
        )
    except Exception:
        bot.send_message(message.chat.id, "📊 Could not fetch member count")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            update = telebot.types.Update.de_json(json.loads(body.decode("utf-8")))
            bot.process_new_updates([update])
        except Exception as e:
            print(f"Error processing update: {e}")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(
            json.dumps({"status": "Bot is running", "webhook": True}).encode()
        )
