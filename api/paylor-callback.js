if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const crypto = require('crypto');

module.exports = async (req, res) => {
  // ====================== CORS ======================
  const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log(`[${new Date().toISOString()}] Paylor Callback received - Body: ${JSON.stringify(req.body)}`);

  const callbackData = req.body;
  const signature = req.headers['x-webhook-signature'] || req.headers['x-paylor-signature'];

  // Signature verification
  const webhookSecret = process.env.PAYLOR_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(callbackData)) // Note: For production, use rawBody for exact match
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid Paylor webhook signature');
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }
  }

  const reference = callbackData.reference || callbackData.merchantReference || callbackData.transaction?.reference;
  const status = callbackData.status || callbackData.transaction?.status || callbackData.event;

  if (!reference) {
    console.log('Callback missing reference');
    return res.status(400).json({ success: false, error: 'Missing reference' });
  }

  console.log(`✅ Paylor Callback processed for ${reference} → Status: ${status}`);

  // TODO: Add your database logic here (e.g. update order status)
  // Example: if (status === 'COMPLETED' || status === 'CONFIRMED') { ... }

  return res.status(200).json({ success: true, message: 'Callback received' });
};