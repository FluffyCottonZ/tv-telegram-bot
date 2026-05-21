const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = '8287004701:AAFl0TAl_9yMHvzgSmgYXYCy-7aZY7PdHEM';
const CHAT_IDS = ['7438696277', '-5166430497'];

function sendTelegram(body) {
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
  const emoji = action === 'BUY' ? '🟢' : '🔴';

  const message = `${emoji} *${action} SIGNAL*\n\n📊 Symbol: *${symbol}*\n💰 Price: *${price}*\n🛑 SL: *${sl}*\n🎯 TP: *${tp}*\n\n📱 Open MT4 and place your order!`;

  CHAT_IDS.forEach(id => {
    const body = JSON.stringify({
      chat_id: id,
      text: message,
      parse_mode: 'Markdown'
    });
    sendTelegram(body);
  });

  res.json({ status: 'ok' });
});

app.listen(process.env.PORT || 3000, () => console.log('Bot server running'));
