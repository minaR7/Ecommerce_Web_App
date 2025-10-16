const express = require('express');
const couponController = require('../controllers/couponController');
const router = express.Router();

router.post('/validate-coupon', couponController.validateCoupon);
module.exports = router;
