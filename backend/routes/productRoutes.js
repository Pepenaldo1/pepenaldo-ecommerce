const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listProducts, getProduct, listCategories, listBestSellers } = require('../controllers/productController');
const { createReview, listReviews } = require('../controllers/reviewController');

router.get('/meta/categories', listCategories);
router.get('/meta/best-sellers', listBestSellers);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', requireAuth, createReview);

module.exports = router;
