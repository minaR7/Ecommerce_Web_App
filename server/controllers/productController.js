const sql = require('mssql');

// GET all products, or filter by subcategory
// exports.getProducts = async (req, res) => {
//     const { subcategory } = req.query;
//     try {
//         let query = 'SELECT * FROM products';
//         if (subcategory) {
//             query += ` WHERE subcategory_id = ${subcategory}`;
//         }

//         const result = await sql.query(query);
//         res.json(result.recordset);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
exports.getProducts = async (req, res) => {
    const { subcategory } = req.query;
    // console.log(req)
    try {
        let query = `
            SELECT 
                p.product_id, p.name, p.description, p.price,  p.stock_quantity, p.cover_img,
                COUNT(r.review_id) AS total_reviews, 
                ROUND(AVG(CAST(r.rating AS FLOAT)),2) AS avg_rating
            FROM products p
            LEFT JOIN reviews r ON p.product_id = r.product_id
        `;

        if (subcategory) {
            query += ` WHERE p.subcategory_id = ${subcategory}`;
        }

        query += ' GROUP BY p.product_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img';  // include all your product columns here

        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET single product
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        // const result = await sql.query`SELECT * FROM products WHERE product_id = ${id}`;
        const result = await sql.query`SELECT p.product_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img, p.images, 
        AVG(r.rating) AS avg_rating
         FROM products p
         LEFT JOIN reviews r ON p.product_id = r.product_id
         WHERE p.product_id = ${id}
            GROUP BY p.product_id, p.name, p.created_at, p.description, p.price, p.stock_quantity, p.cover_img, p.images`
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
    }
};

// GET products by search query (name, category, subcategory)
exports.searchProducts = async (req, res) => {
    const { q } = req.query;
    console.log("req", req)
    try {
        const result = await sql.query`
            SELECT p.*, c.name AS category, s.name AS subcategory
            FROM products p
            JOIN subcategories s ON p.subcategory_id = s.subcategory_id
            JOIN categories c ON s.category_id = c.category_id
            WHERE p.name LIKE '%' + ${q} + '%'
            OR s.name LIKE '%' + ${q} + '%'
            OR c.name LIKE '%' + ${q} + '%'
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
    }
};

// POST new product
exports.createProduct = async (req, res) => {
    const { subcategory_id, name, description, price, stock_quantity } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });

    try {
        await sql.query`
            INSERT INTO products (subcategory_id, name, description, price, stock_quantity)
            VALUES (${subcategory_id}, ${name}, ${description}, ${price}, ${stock_quantity})
        `;
        res.status(201).json({ message: 'Product created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT update product
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { subcategory_id, name, description, price, stock_quantity } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });

    try {
        const result = await sql.query`
            UPDATE products
            SET subcategory_id = ${subcategory_id}, name = ${name}, description = ${description}, price = ${price}, stock_quantity = ${stock_quantity}
            WHERE product_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM products WHERE product_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
