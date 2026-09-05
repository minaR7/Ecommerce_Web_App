const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/stats', verifyToken, requireAdmin, orderController.getDashboardStats);
router.get('/', verifyToken, requireAdmin, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/status', verifyToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
