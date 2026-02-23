const express = require('express');
const productController = require('../controllers/productController');
const { uploadProductMedia } = require('../middleware/upload');
const router = express.Router();

// router.get('/', productController.getProducts);
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
// router.post('/', uploadProductMedia, productController.createProduct);
// router.post('/', (req, res, next) => {
//   uploadProductMedia(req, res, function (err) {
//     if (err) {
//       console.error('Multer error:', err.message);
//       return res.status(400).json({ error: err.message });
//     }
//     next();
//   });
// }, productController.createProduct);
router.post('/', async (req, res, next) => {
  try {
    // Wrap Multer upload in a Promise
    await new Promise((resolve, reject) => {
      uploadProductMedia(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Call your controller
    await productController.createProduct(req, res);
  } catch (err) {
    console.error('Upload or server error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      uploadProductMedia(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    await productController.updateProduct(req, res);
  } catch (err) {
    console.error('Upload or server error (PUT):', err);
    res.status(400).json({ error: err.message });
  }
});
router.delete('/:id', productController.deleteProduct);

module.exports = router;
