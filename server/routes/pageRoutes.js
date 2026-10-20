
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifyToken, requireAdmin, pageController.getPages);
router.post('/', verifyToken, requireAdmin, pageController.createPage);
router.get('/:slug', pageController.getPageBySlug);
router.put('/:slug', verifyToken, requireAdmin, pageController.updatePage);
router.delete('/:id', verifyToken, requireAdmin, pageController.deletePage);

module.exports = router;
