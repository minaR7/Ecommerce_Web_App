const express = require('express');
const subcategoryController = require('../controllers/subcategoryController');
const { uploadSubcategoryImage } = require('../middleware/upload');
const router = express.Router();

router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.post('/', uploadSubcategoryImage, subcategoryController.createSubcategory);
router.put('/:id', uploadSubcategoryImage, subcategoryController.updateSubcategory);
router.delete('/:id', subcategoryController.deleteSubcategory);
router.post('/upload', uploadSubcategoryImage, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const urlPath = `assets/uploads/subcategories/${req.file.filename}`;
  return res.status(201).json({ url: urlPath });
});

module.exports = router;
