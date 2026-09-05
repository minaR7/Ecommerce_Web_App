const express = require('express');
const sizeController = require('../controllers/sizeController');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', sizeController.getSizes);
router.get('/:id', sizeController.getSizeById);

//admin only
router.post('/', verifyToken, requireAdmin, sizeController.createSize);
router.put('/:id', verifyToken, requireAdmin, sizeController.updateSize);
router.delete('/:id', verifyToken, requireAdmin, sizeController.deleteSize);

module.exports = router;