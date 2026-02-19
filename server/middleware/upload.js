const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ROOT = process.env.ASSETS_UPLOAD_DIR || path.join(__dirname, '..', 'assets', 'uploads');

const ensureDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
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
      ensureDir(dest);
      cb(null, dest);
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
    ensureDir(dest);
    cb(null, dest);
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
  { name: 'size_chart', maxCount: 1 },
]);



  
