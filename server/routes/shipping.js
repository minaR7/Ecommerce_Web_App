const express = require('express');
const controller = require('../controllers/shippingRatesController');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Public — the storefront Cart and Checkout pages read rates anonymously.
router.get('/', controller.getAll);
router.get('/:country', controller.getByCountry);

// Admin only.
router.post('/', verifyToken, requireAdmin, controller.create);
router.put('/:id', verifyToken, requireAdmin, controller.update);
router.delete('/:id', verifyToken, requireAdmin, controller.remove);

module.exports = router;
