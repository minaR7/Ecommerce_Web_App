const express = require('express');
const productController = require('../controllers/productController');
const { uploadProductImages, uploadSizeChart } = require('../middleware/upload');
const router = express.Router();

// router.get('/', productController.getProducts);
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.post('/', uploadProductImages, uploadSizeChart, productController.createProduct);
router.put('/:id', uploadProductImages, uploadSizeChart, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
