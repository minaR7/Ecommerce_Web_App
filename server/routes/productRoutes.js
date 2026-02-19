const express = require('express');
const productController = require('../controllers/productController');
const { uploadProductMedia } = require('../middleware/upload');
const router = express.Router();

// router.get('/', productController.getProducts);
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.post('/', uploadProductMedia, productController.createProduct);
router.put('/:id', uploadProductMedia, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
