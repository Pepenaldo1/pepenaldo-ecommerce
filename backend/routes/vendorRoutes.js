const express = require('express');
const router = express.Router();
const { requireAuth, requireVendor } = require('../middleware/auth');
const {
  becomeVendor,
  listMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  getVendorProfile,
} = require('../controllers/vendorController');

// Any logged-in user can apply to become a vendor.
router.post('/register', requireAuth, becomeVendor);

// Public vendor storefront — no auth required.
router.get('/:id', getVendorProfile);

// Vendor-only product management (scoped to their own products).
router.get('/me/products', requireAuth, requireVendor, listMyProducts);
router.post('/me/products', requireAuth, requireVendor, createMyProduct);
router.put('/me/products/:id', requireAuth, requireVendor, updateMyProduct);
router.delete('/me/products/:id', requireAuth, requireVendor, deleteMyProduct);

module.exports = router;
