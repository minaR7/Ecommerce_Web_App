const express = require('express');
const colorController = require('../controllers/colorController');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', colorController.getColors);
router.get('/:id', colorController.getColorById);


router.post('/', verifyToken, requireAdmin, colorController.createColor);
router.put('/:id', verifyToken, requireAdmin, colorController.updateColor);
router.delete('/:id', verifyToken, requireAdmin, colorController.deleteColor);

module.exports = router;