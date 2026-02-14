const express = require('express');
const sizeController = require('../controllers/sizeController');
const router = express.Router();

router.get('/', sizeController.getSizes);
router.get('/:id', sizeController.getSizeById);
router.post('/', sizeController.createSize);
router.put('/:id', sizeController.updateSize);
router.delete('/:id', sizeController.deleteSize);

module.exports = router;