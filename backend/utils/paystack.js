const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Kicks off a transaction. Amount must be in kobo (Naira * 100).
async function initializeTransaction({ email, amount, reference, callback_url }) {
  const { data } = await paystack.post('/transaction/initialize', {
    email,
    amount: Math.round(amount * 100),
    reference,
    callback_url,
  });
  return data.data; // { authorization_url, access_code, reference }
}

// Confirms a transaction actually succeeded before marking an order paid.
async function verifyTransaction(reference) {
  const { data } = await paystack.get(`/transaction/verify/${reference}`);
  return data.data; // { status, amount, reference, ... }
}

module.exports = { initializeTransaction, verifyTransaction };
