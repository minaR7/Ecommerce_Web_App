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
        // res.json(result.recordset);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Append base URL to each subcategory's cover_img
        const modifiedProducts = result.recordset.map((product) => ({
            ...product,
            cover_img: `${baseUrl}/${product.cover_img}`
        }));
        
        res.status(200).json(modifiedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET single product
// exports.getProductById = async (req, res) => {
//     const { id } = req.params;
//     try {
//         // const result = await sql.query`SELECT * FROM products WHERE product_id = ${id}`;
//         const result = await sql.query`SELECT p.product_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img, p.images, 
//         AVG(r.rating) AS avg_rating
//          FROM products p
//          LEFT JOIN reviews r ON p.product_id = r.product_id
//          WHERE p.product_id = ${id}
//             GROUP BY p.product_id, p.name, p.created_at, p.description, p.price, p.stock_quantity, p.cover_img, p.images`
//         if (result.recordset.length === 0) {
//             return res.status(404).json({ error: 'Product not found' });
//         }
//         res.json(result.recordset[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: `Server error ${err}` });
//     }
// };
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    console.log("req recieved", id)
    try {
      // 1. Get product + avg rating
      const productResult = await sql.query`
        SELECT 
        p.product_id, p.name, p.description, p.cover_img, p.price, p.images,
        AVG(CAST(r.rating AS FLOAT)) AS avg_rating,
        c.name AS category,
        sc.name AS subcategory
        FROM products p
        LEFT JOIN reviews r ON p.product_id = r.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.subcategory_id
        WHERE p.product_id = ${id}
        GROUP BY p.product_id, p.name, p.description, p.cover_img, p.price, p.images, c.name, sc.name;    
      `;
  
      if (productResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const product = productResult.recordset[0];
  
      // 2. Get product variants (with color + size names)
      const variantsResult = await sql.query`
        SELECT v.variant_id, v.price, v.stock_quantity,
               c.name AS color, s.name AS size
        FROM product_variants v
        JOIN product_colors c ON v.color_id = c.color_id
        JOIN product_sizes s ON v.size_id = s.size_id
        WHERE v.product_id = ${id}
      `;
  
    //   let slideImages = [];

    //     try {
    //     const parsedImages = JSON.parse(product.images); // safely parse
    //     if (Array.isArray(parsedImages)) {
    //         slideImages = parsedImages.map(img => `${baseUrl}/${img}`);
    //     }
    //     } catch (err) {
    //     console.error("Failed to parse product.images", err);
    //     }

      // 3. Return product with variant details
      res.json({
        ...product,
        cover_img: `${baseUrl}/${product.cover_img}`,
        // slide_images: product.images.map(img => `${baseUrl}/${img}`),
        slide_images: JSON.parse(product.images).map(img => `${baseUrl}/${img.replace(/^\/+/, '')}`),
        avg_rating: parseFloat(product.avg_rating || 0).toFixed(1),
        variants: variantsResult.recordset,
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Server error: ${err}` });
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
