require('dotenv').config();
var config = require('./dbconfig');
const path = require('path')
const cors = require('cors')
const express = require('express');
const sql = require('mssql');
const http = require('http');
const { Server } = require('socket.io');
const { registerNotificationSocket } = require('./sockets/notificationSocket');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationService = require('./services/notificationService');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const addToCartRoute = require('./routes/addToCartRoutes');
const wishlistRoute = require('./routes/wishlistRoutes');
const checkoutRoute = require('./routes/checkout');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoute = require('./routes/coupon')
const shippingRoutes = require('./routes/shipping')
const pageRoutes = require('./routes/pageRoutes');
const colorRoutes = require('./routes/colorRoutes');
const sizeRoutes = require('./routes/sizeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const verifyToken = require('./middleware/auth');

const app = express();
// Behind the production reverse proxy (Plesk/Nginx) TLS is terminated upstream,
// so the request reaches Express over plain HTTP. Trusting the proxy makes
// req.protocol honor the X-Forwarded-Proto header, so absolute asset URLs built
// as `${req.protocol}://${req.get('host')}` come out as https and don't trip
// iOS Safari's mixed-content blocking.
app.set('trust proxy', true);

// Defensive fallback: if the proxy ever fails to send X-Forwarded-Proto, force
// req.protocol to https in production so generated asset URLs are never http
// (which iOS Safari blocks as mixed content).
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    Object.defineProperty(req, 'protocol', { get: () => 'https', configurable: true });
    next();
  });
}

const server = http.createServer(app);

// const allowedOrigins = ['http://localhost:5173', 'http://example.com', 'http://anotherdomain.com'];

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, origin); // Allow the request
//         } else {
//             callback(new Error('Not allowed by CORS')); // Reject the request
//         }
//     },
//     credentials: true // Only needed if you're sending cookies or auth headers
// }));


app.use(express.json());
const allowedOrigins = [
  'https://elmaghrib.com',
  'http://elmaghrib.com',
  'https://www.elmaghrib.com',
  'http://www.elmaghrib.com',
  'https://admin.elmaghrib.com',
  'http://admin.elmaghrib.com',
  'https://www.admin.elmaghrib.com',
  'http://www.admin.elmaghrib.com',
  'http://78.159.113.48:80',
  'https://78.159.113.48:80',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
];

app.use(cors({
  origin: function (origin, callback) {
    console.log(origin)
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Reject cleanly without allowing the origin. Throwing an Error here would
    // bubble up as a 500 (which is what the browser was reporting) instead of a
    // normal CORS denial.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:4173'],
//     // 192.168.100.242
//     credentials: true // Only needed if you're sending cookies or auth headers
// }));


// app.options('*', cors());

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', addToCartRoute);
app.use('/api/wishlist', wishlistRoute);
app.use('/api/users', userRoutes);
app.use('/api/checkout', checkoutRoute);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoute)
app.use('/api/shipping', shippingRoutes)
app.use('/api/pages', pageRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
// router.post('/add', verifyToken, addToCart);
// Serve uploaded files from the configurable upload dir first (so uploads can
// live outside httpdocs on locked-down hosts), then fall back to the bundled
// assets folder. Must mirror ASSETS_UPLOAD_DIR used in middleware/upload.js.
const UPLOAD_DIR = process.env.ASSETS_UPLOAD_DIR || path.join(__dirname, 'assets', 'uploads');
app.use('/assets/uploads', express.static(UPLOAD_DIR));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const extractRoutes = (router, basePath = '') => {
  const out = [];
  const walk = (r, bp) => {
    r.stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        out.push({ path: `${bp}${layer.route.path}`, methods });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        walk(layer.handle, bp);
      }
    });
  };
  walk(router, basePath);
  return out;
};

const listAllRoutes = () => {
  const routes = [
    ...extractRoutes(categoryRoutes, '/api/categories'),
    ...extractRoutes(subcategoryRoutes, '/api/subcategories'),
    ...extractRoutes(productRoutes, '/api/products'),
    ...extractRoutes(addToCartRoute, '/api/cart'),
    ...extractRoutes(wishlistRoute, '/api/wishlist'),
    ...extractRoutes(userRoutes, '/api/users'),
    ...extractRoutes(checkoutRoute, '/api/checkout'),
    ...extractRoutes(orderRoutes, '/api/orders'),
    ...extractRoutes(couponRoute, '/api/coupons'),
    ...extractRoutes(shippingRoutes, '/api/shipping'),
    ...extractRoutes(pageRoutes, '/api/pages'),
    ...extractRoutes(colorRoutes, '/api/colors'),
    ...extractRoutes(sizeRoutes, '/api/sizes'),
  ];
  return routes;
};

app.get('/api/_routes', (req, res) => {
  res.json(listAllRoutes());
});

// Centralised error handler — turns raw upload/permission crashes into clear
// JSON responses (must be registered after all routes; 4 args = error handler).
app.use((err, req, res, next) => {
  if (!err) return next();
  // File-system permission problems (common on locked-down Windows/Plesk hosts)
  if (err.code === 'EPERM' || err.code === 'EACCES') {
    console.error('Upload failed — directory not writable:', err.path || err.message);
    return res.status(500).json({
      error: 'Could not save the uploaded file: the server upload folder is not writable. '
        + 'Grant write permission to the uploads folder, or set ASSETS_UPLOAD_DIR to a writable path.',
    });
  }
  // Multer limits + our image-type filter
  if (err.name === 'MulterError' || /Only image files are allowed/i.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: err.message || 'Internal server error' });
});

const startServer = async () => {
    try {
        // await sql.connect(process.env.DB_CONNECTION_STRING);
        await sql.connect(config);
        console.log('Connected successfully');
        console.table(listAllRoutes());
        // app.listen(3005,'0.0.0.0', () => console.log('Server running on port 3005'));
        const io = new Server(server, {
          cors: {
            origin:function (origin, callback) {
            console.log(origin)
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
              return callback(null, true);
            } else {
              return callback(new Error('Not allowed by CORS'));
            }
          },  
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
          },
        });
        registerNotificationSocket(io);
        notificationService.init(io);
        // Under iisnode (Plesk/Windows) the app must listen on the port the host
        // assigns via process.env.PORT (a named pipe). Fall back to 3005 locally.
        const port = process.env.PORT || 3005;
        server.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (err) {
        console.error('Database connection failed', err);
    }
};

startServer();
