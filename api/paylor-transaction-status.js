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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { reference, transactionId } = req.query;
  const id = transactionId || reference;

  console.log(`[${new Date().toISOString()}] Paylor Status Check - ID: ${id}`);

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing transaction ID or reference' });
  }

  try {
    const PAYLOR_API_KEY = process.env.PAYLOR_API_KEY;
    const PAYLOR_BASE_URL = process.env.PAYLOR_BASE_URL || 'https://api.paylorke.com/api/v1';

    if (!PAYLOR_API_KEY) {
      console.error('PAYLOR_API_KEY is missing in .env');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const statusUrl = `${PAYLOR_BASE_URL}/merchants/payments/transactions/${id}`;

    const response = await axios.get(statusUrl, {
      headers: {
        Authorization: `Bearer ${PAYLOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const data = response.data;
    console.log('Paylor Status Response:', data);

    return res.json({
      success: true,
      status: data.status || data.transaction?.status || 'PENDING',
      data: data,
    });

  } catch (error) {
    const errorData = error.response?.data || { message: error.message };
    console.error('Paylor Status Error:', JSON.stringify(errorData, null, 2));

    return res.status(error.response?.status || 500).json({
      success: false,
      error: errorData.message || 'Failed to fetch transaction status',
    });
  }
};