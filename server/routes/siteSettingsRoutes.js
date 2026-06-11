const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteSettingsController');
const { uploadSiteImage } = require('../middleware/upload');

router.get('/', ctrl.getSettings);
router.put('/', ctrl.updateSettings);
router.post('/upload/logo', uploadSiteImage, ctrl.uploadLogo);
router.post('/upload/hero', uploadSiteImage, ctrl.uploadHero);
router.post('/upload/intro-image', uploadSiteImage, ctrl.uploadIntroImage);

module.exports = router;
