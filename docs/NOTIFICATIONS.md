# Notification Webhook Configuration

`f1-insights` supports automatic broadcast of Pre-Race Previews and Post-Race Debriefs to group channels.

---

## 1. Discord Webhook Setup

1. In your Discord server, go to **Server Settings** > **Integrations** > **Webhooks**.
2. Click **New Webhook**, select your F1 channel, and copy the Webhook URL.
3. Add the Webhook URL to your `.env` file:
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

---

## 2. Telegram Bot Setup

1. Message `@BotFather` on Telegram to create a new bot and obtain the `TELEGRAM_BOT_TOKEN`.
2. Add the bot to your group chat and fetch the `TELEGRAM_CHAT_ID`.
3. Add credentials to your `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
   TELEGRAM_CHAT_ID=-100123456789
   ```

---

## 3. Triggering Notifications Manually

You can test notifications at any time by running:
```bash
npm run pipeline
```
