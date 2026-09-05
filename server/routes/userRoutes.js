const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Public auth endpoints.
router.post('/register', userController.registerUser);
router.get('/check-email', userController.checkEmail);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Any authenticated user.
router.get('/me', verifyToken, userController.getMe);

// Admin only.
router.get('/', userController.getUsers);
router.get('/customers', userController.getCustomers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
