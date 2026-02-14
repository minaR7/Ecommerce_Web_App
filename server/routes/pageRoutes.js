
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.getPages);
router.post('/', pageController.createPage);
router.get('/:slug', pageController.getPageBySlug);
router.put('/:slug', pageController.updatePage);

module.exports = router;
