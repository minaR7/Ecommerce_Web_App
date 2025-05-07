// require('dotenv').config();
var config = require('./dbconfig');
const express = require('express');
const sql = require('mssql');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);

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
