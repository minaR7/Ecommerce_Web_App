require('dotenv').config();
var config = require('./dbconfig');
const path = require('path')
const cors = require('cors')
const express = require('express');
const sql = require('mssql');
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
const verifyToken = require('./middleware/auth');

const app = express();

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
  'http://78.159.113.48:80',
  'https://78.159.113.48:80',
  'http://localhost:5173',
  'http://localhost:5174',
  // 'http://localhost:5175',
  'http://localhost:4173',
];

app.use(cors({
  origin: function (origin, callback) {
    console.log(origin)
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
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
// router.post('/add', verifyToken, addToCart);
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

const startServer = async () => {
    try {
        // await sql.connect(process.env.DB_CONNECTION_STRING);
        await sql.connect(config);
        console.log('Connected successfully');
        console.table(listAllRoutes());
        app.listen(3005,'0.0.0.0', () => console.log('Server running on port 3005'));
    } catch (err) {
        console.error('Database connection failed', err);
    }
};

startServer();
