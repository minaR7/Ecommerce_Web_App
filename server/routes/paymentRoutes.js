const express = require('express');
const router = express.Router();
const { createIntent } = require('../controllers/paymentController');

router.post('/intents', createIntent);

module.exports = router;
