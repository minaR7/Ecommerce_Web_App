
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', pageController.getPages);
router.post('/', verifyToken, requireAdmin, pageController.createPage);
router.get('/:slug', pageController.getPageBySlug);
router.put('/:slug', verifyToken, requireAdmin, pageController.updatePage);

module.exports = router;
