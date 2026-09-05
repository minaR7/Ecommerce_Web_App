const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/unread', verifyToken, requireAdmin, controller.getUnread);
router.post('/:id/read', verifyToken, requireAdmin, controller.markAsRead);
router.post('/mark-all-read', verifyToken, requireAdmin, controller.markAllAsRead);

module.exports = router;
