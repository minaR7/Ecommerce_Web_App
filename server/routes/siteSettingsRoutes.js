const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteSettingsController');
const { uploadSiteImage, uploadPaymentIcon } = require('../middleware/upload');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Public storefront endpoint — only returns UI-facing fields (no internal config
// like default_intl_shipping_fee). The client's useSiteSettings hook calls this.
router.get('/public', ctrl.getPublicSettings);

// Admin-only endpoints below — require valid JWT + is_admin flag.
router.get('/', verifyToken, requireAdmin, ctrl.getSettings);
router.put('/', verifyToken, requireAdmin, ctrl.updateSettings);
router.post('/upload/logo', verifyToken, requireAdmin, uploadSiteImage, ctrl.uploadLogo);
router.post('/upload/hero', verifyToken, requireAdmin, uploadSiteImage, ctrl.uploadHero);
router.post('/upload/intro-image', verifyToken, requireAdmin, uploadSiteImage, ctrl.uploadIntroImage);
router.post('/upload/payment-icon', verifyToken, requireAdmin, uploadPaymentIcon, ctrl.uploadPaymentIcon);

module.exports = router;
