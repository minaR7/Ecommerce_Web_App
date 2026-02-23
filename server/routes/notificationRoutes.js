const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.get('/unread', controller.getUnread);
router.post('/:id/read', controller.markAsRead);
router.post('/mark-all-read', controller.markAllAsRead);

module.exports = router;
