const express = require('express');
const colorController = require('../controllers/colorController');
const router = express.Router();

router.get('/', colorController.getColors);
router.get('/:id', colorController.getColorById);
router.post('/', colorController.createColor);
router.put('/:id', colorController.updateColor);
router.delete('/:id', colorController.deleteColor);

module.exports = router;