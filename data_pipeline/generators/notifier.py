"""
Notifier Module for F1 Insights.
Dispatches Pre-Race and Post-Race morning briefs to Discord webhooks
and Telegram bot group channels.
"""
import os
import requests
import logging

logger = logging.getLogger("F1Notifier")

class F1Notifier:
    def __init__(self):
        self.discord_url = os.getenv("DISCORD_WEBHOOK_URL", "")
        self.telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

    def send_discord_brief(self, brief_payload: dict) -> bool:
        """Send formatted brief markdown to Discord webhook."""
        if not self.discord_url:
            logger.info("DISCORD_WEBHOOK_URL not configured. Skipping Discord dispatch.")
            return False

        race_name = brief_payload.get("raceName", "Grand Prix")
        brief_type = "🏎️ PRE-RACE PREVIEW" if brief_payload.get("type") == "PRE_RACE" else "🏁 POST-RACE DEBRIEF"

        # Construct Discord Embed
        embed_facts = []
        for fact in brief_payload.get("facts", [])[:4]:
            embed_facts.append({
                "name": f"[{fact['badge']}] {fact['topic']} ({fact['stat']})",
                "value": fact['detail'],
                "inline": False
            })

        payload = {
            "content": f"**{brief_type}: {race_name.upper()}**\n*Latest telemetry & weekend morning brief ready!*",
            "embeds": [
                {
                    "title": brief_payload.get("title"),
                    "color": 16717825 if brief_payload.get("type") == "PRE_RACE" else 61695, # F1 Red or Cyan
                    "fields": embed_facts,
                    "footer": {
                        "text": "F1 Insights • Powered by TracingInsights"
                    }
                }
            ]
        }

        try:
            res = requests.post(self.discord_url, json=payload, timeout=10)
            if res.status_code in [200, 204]:
                logger.info("Successfully sent morning brief to Discord!")
                return True
            else:
                logger.warning(f"Discord webhook failed with status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error sending Discord webhook: {e}")

        return False

    def send_telegram_brief(self, brief_payload: dict) -> bool:
        """Send formatted brief text to Telegram group chat."""
        if not self.telegram_token or not self.telegram_chat_id:
            logger.info("Telegram credentials not configured. Skipping Telegram dispatch.")
            return False

        markdown_text = brief_payload.get("markdown", "")
        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"

        payload = {
            "chat_id": self.telegram_chat_id,
            "text": markdown_text,
            "parse_mode": "Markdown"
        }

        try:
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                logger.info("Successfully sent morning brief to Telegram!")
                return True
            else:
                logger.warning(f"Telegram dispatch failed with status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error sending Telegram message: {e}")

        return False
