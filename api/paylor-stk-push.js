if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const axios = require('axios');

module.exports = async (req, res) => {
  // ====================== CORS ======================
  const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { phoneNumber, amount, reference, description } = req.body;

  console.log(`[${new Date().toISOString()}] Paylor STK Push requested - Phone: ${phoneNumber}, Amount: ${amount}, Ref: ${reference}`);

  if (!phoneNumber || !amount || !reference) {
    console.log('Missing required fields:', { phoneNumber, amount, reference });
    return res.status(400).json({ success: false, error: 'Missing phoneNumber, amount, or reference' });
  }

  // Phone formatting for Paylor
  let formattedPhone = phoneNumber.replace(/\s/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `254${formattedPhone.slice(1)}`;
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.slice(1);
  }

  console.log(`Formatted phone number: ${formattedPhone}`);

  if (!/^254[17]\d{8}$/.test(formattedPhone)) {
    console.log('Invalid phone number:', phoneNumber);
    return res.status(400).json({
      success: false,
      error: 'Invalid Kenyan phone number. Must start with 2547...',
    });
  }

  if (isNaN(amount) || amount < 1) {
    console.log('Invalid amount:', amount);
    return res.status(400).json({ success: false, error: 'Amount must be at least 1 KES' });
  }

  try {
    const PAYLOR_API_KEY = process.env.PAYLOR_API_KEY;
    const PAYLOR_BASE_URL = process.env.PAYLOR_BASE_URL || 'https://apipaylor.webnixke.com/api/v1';
    const CHANNEL_ID = process.env.PAYLOR_CHANNEL_ID;

    if (!PAYLOR_API_KEY || !CHANNEL_ID) {
      console.error('Missing Paylor credentials');
      return res.status(500).json({ success: false, error: 'Server configuration error: Missing Paylor credentials' });
    }

    const callbackUrl = process.env.PAYLOR_CALLBACK_URL || 
      `${req.headers.origin || 'http://localhost:3000'}/api/paylor-callback`;

    const payload = {
      phone: formattedPhone,
      amount: Number(amount),
      reference: reference,
      channelId: CHANNEL_ID,
      description: description || 'Fuliza Boost Fee',
      callbackUrl: callbackUrl,
    };

    console.log('Sending Paylor payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${PAYLOR_BASE_URL}/merchants/payments/stk-push`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYLOR_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    console.log('Paylor STK Push success:', response.data);

    return res.status(201).json({
      success: true,
      transactionId: response.data.transactionId,
      message: response.data.message || 'STK Push sent successfully',
    });

  } catch (error) {
    const errorData = error.response?.data || { message: error.message };
    console.error('Paylor STK Push Error:', JSON.stringify(errorData, null, 2));
    return res.status(error.response?.status || 500).json({
      success: false,
      error: errorData.message || errorData.error || 'Failed to initiate STK Push',
      data: errorData,
    });
  }
};