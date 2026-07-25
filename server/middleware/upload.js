const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ROOT = process.env.ASSETS_UPLOAD_DIR || path.join(__dirname, '..', 'assets', 'uploads');
exports.UPLOAD_ROOT = ROOT;

// Create the target dir. Lets errors propagate (via the multer callback) so a
// non-writable folder surfaces as a clear error instead of a silent 500.
const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() +
//       '-' +
//       file.originalname.replace(/\s+/g, '-').toLowerCase();
//     cb(null, uniqueName);
//   },
// });

const makeStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(ROOT, subdir);
      try { ensureDir(dest); cb(null, dest); }
      catch (err) { cb(err); }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-');
      const stamp = Date.now();
      cb(null, `${base}-${stamp}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

// const fileFilter = (req, file, cb) => {
//   const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only PNG, JPG, JPEG, WEBP allowed'), false);
//   }
// };

exports.uploadCategoryImage = multer({
  storage: makeStorage('categories'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

exports.uploadSubcategoryImage = multer({
  storage: makeStorage('subcategories'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = file.fieldname === 'size_chart' ? 'size-charts' : 'products';
    const dest = path.join(ROOT, subdir);
    try { ensureDir(dest); cb(null, dest); }
    catch (err) { cb(err); }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-');
    const stamp = Date.now();
    cb(null, `${base}-${stamp}${ext}`);
  },
});

exports.uploadProductMedia = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'cover_img', maxCount: 1 },
  { name: 'size_chart', maxCount: 1 },
]);

exports.uploadSiteImage = multer({
  storage: makeStorage('site'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

// Payment-method icons are typically SVGs, so allow SVG in addition to raster images.
const iconFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (including SVG) are allowed'));
};

exports.uploadPaymentIcon = multer({
  storage: makeStorage('site'),
  fileFilter: iconFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');



  
