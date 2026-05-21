const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const CHAT_ID = 'YOUR_CHAT_ID_HERE';

app.post('/webhook', async (req, res) => {
  const data = req.body;

  const symbol = data.symbol || 'UNKNOWN';
  const action = data.action || 'UNKNOWN';
  const price = data.price || 'market';
  const sl = data.sl || 'N/A';
  const tp = data.tp || 'N/A';

  const mt4Link = `metatrader4://trade?symbol=${symbol}`;

  const message = `
🚨 *TRADING SIGNAL*

📊 Symbol: *${symbol}*
📈 Action: *${action}*
💰 Price: *${price}*
🛑 Stop Loss: *${sl}*
🎯 Take Profit: *${tp}*

Tap below to open MT4 👇
  `;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: `🟢 Open MT4 → ${symbol}`,
            url: mt4Link
          }
        ]]
      }
    })
  });

  res.json({ status: 'ok' });
});

app.listen(process.env.PORT || 3000, () => console.log('Bot server running'));
