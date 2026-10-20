const express = require('express');
const couponController = require('../controllers/couponController');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifyToken, requireAdmin, couponController.getCoupons);
router.get('/:id', verifyToken, requireAdmin, couponController.getCouponById);
router.post('/', verifyToken, requireAdmin, couponController.createCoupon);
router.put('/:id', verifyToken, requireAdmin, couponController.updateCoupon);
router.delete('/:id', verifyToken, requireAdmin, couponController.deleteCoupon);

router.get('/validate/:code', couponController.validateCoupon);
router.post('/validate-coupon', couponController.validateCoupon);
module.exports = router;
