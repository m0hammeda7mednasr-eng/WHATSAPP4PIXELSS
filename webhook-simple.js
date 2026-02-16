// 🚀 Simple Webhook - يشتغل على أي حاجة!
const express = require('express');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'whatsapp_crm_2024';

// GET - Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📥 Verification:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verification failed');
    res.status(403).send('Forbidden');
  }
});

// POST - Receive Messages
app.post('/webhook', (req, res) => {
  console.log('📨 Message received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook running on port ${PORT}`);
  console.log(`📋 Use this URL: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Verify token: ${VERIFY_TOKEN}`);
});

module.exports = app;