const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);
router.get('/customers', userController.getCustomers);
router.post('/login', userController.loginUser);

module.exports = router;
