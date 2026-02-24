const express = require('express');
const router = express.Router();
const cartController = require('../controllers/addToCartController');

router.post('/add', cartController.addToCart);
router.post('/add/bulk', cartController.addBulkToCart);
router.get('/:userId', cartController.getCart);
router.put('/:cartItemId', cartController.updateCartItem);
router.delete('/:cartItemId', cartController.removeFromCart);

module.exports = router;