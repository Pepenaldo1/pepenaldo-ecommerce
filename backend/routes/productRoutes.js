const express = require('express');
const router = express.Router();
const { listProducts, getProduct, listCategories } = require('../controllers/productController');

router.get('/meta/categories', listCategories);
router.get('/', listProducts);
router.get('/:id', getProduct);

module.exports = router;
