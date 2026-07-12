const express = require('express');
const router = express.Router();
const {
  checkout,
  verifyPayment,
  paystackWebhook,
  myOrders,
} = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

// NOTE: webhook must receive the raw body for signature verification —
// this is wired up with express.raw() in server.js, not here.
router.post('/webhook', paystackWebhook);

router.use(requireAuth);
router.post('/checkout', checkout);
router.get('/verify/:reference', verifyPayment);
router.get('/mine', myOrders);

module.exports = router;
