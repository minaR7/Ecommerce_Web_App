const express = require('express');
const router = express.Router();
const cartController = require('../controllers/addToCartController');

router.post('/', cartController.addToCart);
router.get('/:userId', cartController.getCart);
router.delete('/:cartItemId', cartController.removeFromCart);

module.exports = router;