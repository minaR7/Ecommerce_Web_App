const express = require('express');
const productController = require('../controllers/productController');
const { uploadProductImages, uploadSizeChart } = require('../middleware/upload');
const router = express.Router();

// router.get('/', productController.getProducts);
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/size-chart', productController.getSizeChart); // Get size chart
router.get('/:id', productController.getProductById);
router.post('/', uploadProductImages, productController.createProduct);
router.post('/size-chart', uploadSizeChart, productController.uploadSizeChart); // Upload size chart
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
