const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
