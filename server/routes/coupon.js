const express = require('express');
const couponController = require('../controllers/couponController');
const router = express.Router();

router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.get('/validate/:code', couponController.validateCoupon);
router.post('/validate-coupon', couponController.validateCoupon);
module.exports = router;
