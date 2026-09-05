const express = require('express');
const subcategoryController = require('../controllers/subcategoryController');
const { uploadSubcategoryImage } = require('../middleware/upload');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);

//admin only
router.post('/', verifyToken, requireAdmin, uploadSubcategoryImage, subcategoryController.createSubcategory);
router.put('/:id', verifyToken, requireAdmin, uploadSubcategoryImage, subcategoryController.updateSubcategory);
router.delete('/:id', verifyToken, requireAdmin, subcategoryController.deleteSubcategory);
router.post('/upload', verifyToken, requireAdmin, uploadSubcategoryImage, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const urlPath = `assets/uploads/subcategories/${req.file.filename}`;
  return res.status(201).json({ url: urlPath });
});

module.exports = router;
