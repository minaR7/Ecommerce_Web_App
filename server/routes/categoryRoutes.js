const express = require('express');
const categoryController = require('../controllers/categoryController');
const { uploadCategoryImage } = require('../middleware/upload');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

//admin only
// router.post('/', categoryController.createCategory);
// router.post('/', uploadCategoryImage.single('image'), categoryController.createCategory);

router.post('/', verifyToken, requireAdmin, uploadCategoryImage, categoryController.createCategory);
router.put('/:id', verifyToken, requireAdmin, uploadCategoryImage, categoryController.updateCategory);
router.delete('/:id', verifyToken, requireAdmin, categoryController.deleteCategory);
// router.post('/upload', uploadCategoryImage, (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   const urlPath = `assets/uploads/categories/${req.file.filename}`;
//   return res.status(201).json({ url: urlPath });
// });

module.exports = router;
