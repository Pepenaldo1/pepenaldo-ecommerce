const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
} = require('../controllers/productController');
const { listAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { updateSettings } = require('../controllers/settingsController');

router.use(requireAuth, requireAdmin);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category management
router.post('/categories', createCategory);

// Site settings (hero image, etc.)
router.put('/settings', updateSettings);

// Order management
router.get('/orders', listAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
