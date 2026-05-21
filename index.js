const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = '8287004701:AAFl0TAl_9yMHvzgSmgYXYCy-7aZY7PdHEM';
const CHAT_ID = '7438696277';

function sendTelegram(message, buttonText, buttonUrl) {
  const body = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
    }
  });

  console.log('Sending to Telegram...');
  console.log('Token:', TELEGRAM_TOKEN);
  console.log('Chat ID:', CHAT_ID);
  console.log('Body:', body);

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { console.log('Telegram response:', data); });
  });

  req.on('error', (e) => { console.error('Telegram error:', e.message); });
  req.write(body);
  req.end();
}

app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);

  const data = req.body;
  const symbol = data.symbol || 'UNKNOWN';
  const action = data.action || 'UNKNOWN';
  const price = data.price || 'market';
  const sl = data.sl || 'N/A';
  const tp = data.tp || 'N/A';

  const message = `
🚨 *TRADING SIGNAL*

📊 Symbol: *${symbol}*
📈 Action: *${action}*
💰 Price: *${price}*
🛑 Stop Loss: *${sl}*
🎯 Take Profit: *${tp}*

Tap below to open MT4 👇
  `;

  const buttonText = `${action === 'BUY' ? '🟢' : '🔴'} Open MT4 → ${symbol}`;
  const buttonUrl = `metatrader4://trade?symbol=${symbol}`;

  sendTelegram(message, buttonText, buttonUrl);

  res.json({ status: 'ok' });
});

app.listen(process.env.PORT || 3000, () => console.log('Bot server running'));
