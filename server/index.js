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
const userRoutes = require('./routes/userRoutes');
const verifyToken = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    // 192.168.100.242
    credentials: true // Only needed if you're sending cookies or auth headers
  }));

// app.options('*', cors());

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', addToCartRoute);
app.use('/api/wishlist', wishlistRoute);
app.use('/api/users', userRoutes);
app.use('/api/checkout', checkoutRoute);
// router.post('/add', verifyToken, addToCart);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const startServer = async () => {
    try {
        // await sql.connect(process.env.DB_CONNECTION_STRING);
        await sql.connect(config);
        console.log('Connected successfully');
        app.listen(3005,'0.0.0.0', () => console.log('Server running on port 3005'));
    } catch (err) {
        console.error('Database connection failed', err);
    }
};

startServer();
