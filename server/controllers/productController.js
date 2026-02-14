const sql = require('mssql');
const path = require('path');
const fs = require('fs');

const SIZE_CHART_FILE = path.join(__dirname, '../data/sizeChart.json');

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
                p.product_id, p.name, p.description, p.price,  p.stock_quantity, p.cover_img,  p.discount_percentage,
                COUNT(r.review_id) AS total_reviews, 
                ROUND(AVG(CAST(r.rating AS FLOAT)),2) AS avg_rating
            FROM products p
            LEFT JOIN reviews r ON p.product_id = r.product_id
        `;

        if (subcategory) {
            query += ` WHERE p.subcategory_id = ${subcategory}`;
        }

        query += ' GROUP BY p.product_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img, p.discount_percentage';  // include all your product columns here

        const result = await sql.query(query);
         // res.json(result.recordset);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const modifiedProducts = result.recordset.map((product) => 
        {
            // Compute discounted price
            const price = parseFloat(product.price);
            const discount = parseFloat(product.discount_percentage || 0);
            const discountedPrice = discount > 0
                ? (price - (price * discount) / 100).toFixed(2)
                : price;     
            return (
            {
                ...product,
                cover_img: `${baseUrl}/${product.cover_img}`,  // Append base URL to each subcategory's cover_img
                discounted_price: discountedPrice
            })
        });
        
        res.status(200).json(modifiedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllProducts = async (req, res) => {
    const { subcategory } = req.query;
    // console.log(req)
    try {
        let query = `
            SELECT 
                p.product_id,
                p.name,
                p.description,
                p.price,
                p.stock_quantity,
                p.cover_img,
                p.images,
                p.discount_percentage,
                COUNT(r.review_id) AS total_reviews,
                ROUND(AVG(CAST(r.rating AS FLOAT)),2) AS avg_rating,
                c.name AS category,
                sc.name AS subcategory,
                ca.colors
            FROM products p
            LEFT JOIN reviews r ON p.product_id = r.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN subcategories sc ON p.subcategory_id = sc.subcategory_id
            LEFT JOIN (
                SELECT v.product_id, STRING_AGG(pc.name, ',') AS colors
                FROM product_variants v
                JOIN product_colors pc ON v.color_id = pc.color_id
                GROUP BY v.product_id
            ) ca ON ca.product_id = p.product_id
        `;

        if (subcategory) {
            query += ` WHERE p.subcategory_id = ${subcategory}`;
        }

        query += ' GROUP BY p.product_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img, p.images, p.discount_percentage, c.name, sc.name, ca.colors';

        const result = await sql.query(query);
         // res.json(result.recordset);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const modifiedProducts = result.recordset.map((product) => 
        {
            // Compute discounted price
            const price = parseFloat(product.price);
            const discount = parseFloat(product.discount_percentage || 0);
            const discountedPrice = discount > 0
                ? (price - (price * discount) / 100).toFixed(2)
                : price;
            let slideImages = [];
            try {
                const parsedImages = product.images ? JSON.parse(product.images) : [];
                if (Array.isArray(parsedImages)) {
                    slideImages = parsedImages.map(img => `${baseUrl}/${String(img).replace(/^\/+/, '')}`);
                }
            } catch (_) {
                slideImages = [];
            }
            const colorsArray = product.colors ? product.colors.split(',') : [];
            return (
            {
                ...product,
                cover_img: `${baseUrl}/${product.cover_img}`,  // Append base URL to each subcategory's cover_img
                discounted_price: discountedPrice,
                slide_images: slideImages,
                colors: colorsArray
            })
        });
        
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
    console.log("req recieved FOR GET SINGLE PRODUCT", id)
    try {
      // 1. Get product + avg rating
      const productResult = await sql.query`
        SELECT 
        p.product_id, p.name, p.description, p.cover_img, p.price, p.images, p.discount_percentage,
        AVG(CAST(r.rating AS FLOAT)) AS avg_rating,
        c.name AS category,
        sc.name AS subcategory
        FROM products p
        LEFT JOIN reviews r ON p.product_id = r.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.subcategory_id
        WHERE p.product_id = ${id}
        GROUP BY p.product_id, p.name, p.description, p.cover_img, p.price, p.images, p.discount_percentage, c.name, sc.name;    
      `;
  
      if (productResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const product = productResult.recordset[0];
  
      // 2. Compute discounted price
      const price = parseFloat(product.price);
      const discount = parseFloat(product.discount_percentage || 0);
      const discountedPrice = discount > 0
        ? (price - (price * discount) / 100).toFixed(2)
        : price;

      // 3. Get product variants (with color + size names)
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

      // 4. Return product with variant details
      res.json({
        ...product,
        cover_img: `${baseUrl}/${product.cover_img}`,
        // slide_images: product.images.map(img => `${baseUrl}/${img}`),
        slide_images: JSON.parse(product.images).map(img => `${baseUrl}/${img.replace(/^\/+/, '')}`),
        avg_rating: parseFloat(product.avg_rating || 0).toFixed(1),
        discounted_price: discountedPrice,
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
    const { category_id, subcategory_id, name, description, price, stock_quantity } = req.body;
    let { sizes, colors } = req.body;

    if (!name) return res.status(400).json({ error: 'Product name is required' });

    // Handle array parsing (FormData sends arrays as multiple entries with same key, or JSON strings)
    // If sent as JSON string manually:
    try { if (typeof sizes === 'string') sizes = JSON.parse(sizes); } catch (e) { sizes = [sizes]; }
    try { if (typeof colors === 'string') colors = JSON.parse(colors); } catch (e) { colors = [colors]; }
    
    // Ensure arrays
    if (!Array.isArray(sizes)) sizes = sizes ? [sizes] : [];
    if (!Array.isArray(colors)) colors = colors ? [colors] : [];

    // Handle images
    const files = req.files || [];
    const imagePaths = files.map(f => `assets/uploads/products/${f.filename}`);
    const cover_img = imagePaths.length > 0 ? imagePaths[0] : null;
    const imagesJson = JSON.stringify(imagePaths);

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Insert Product
        const result = await request.query`
            INSERT INTO products (category_id, subcategory_id, name, description, price, stock_quantity, cover_img, images)
            OUTPUT INSERTED.product_id
            VALUES (${category_id}, ${subcategory_id || null}, ${name}, ${description}, ${price}, ${stock_quantity}, ${cover_img}, ${imagesJson})
        `;
        const productId = result.recordset[0].product_id;

        // Get IDs for colors and sizes
        let colorIds = [];
        if (colors.length > 0) {
            const allColors = await request.query`SELECT color_id, name FROM product_colors`;
            const colorMap = new Map(allColors.recordset.map(c => [c.name.toLowerCase(), c.color_id]));
            colorIds = colors.map(n => colorMap.get(String(n).toLowerCase())).filter(id => id);
        }

        let sizeIds = [];
        if (sizes.length > 0) {
            const allSizes = await request.query`SELECT size_id, name FROM product_sizes`;
            const sizeMap = new Map(allSizes.recordset.map(s => [s.name.toLowerCase(), s.size_id]));
            sizeIds = sizes.map(n => sizeMap.get(String(n).toLowerCase())).filter(id => id);
        }

        // Generate Variants
        if (colorIds.length > 0 && sizeIds.length > 0) {
            for (const colorId of colorIds) {
                for (const sizeId of sizeIds) {
                    await request.query`
                        INSERT INTO product_variants (product_id, color_id, size_id, price, image, stock_quantity)
                        VALUES (${productId}, ${colorId}, ${sizeId}, ${price}, ${cover_img}, ${stock_quantity})
                    `;
                }
            }
        } else if (colorIds.length > 0) {
             for (const colorId of colorIds) {
                 await request.query`
                    INSERT INTO product_variants (product_id, color_id, price, image, stock_quantity)
                    VALUES (${productId}, ${colorId}, ${price}, ${cover_img}, ${stock_quantity})
                 `;
             }
        } else if (sizeIds.length > 0) {
             for (const sizeId of sizeIds) {
                 await request.query`
                    INSERT INTO product_variants (product_id, size_id, price, image, stock_quantity)
                    VALUES (${productId}, ${sizeId}, ${price}, ${cover_img}, ${stock_quantity})
                 `;
             }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Product created', productId });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

exports.uploadSizeChart = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const imageUrl = `assets/uploads/size-charts/${req.file.filename}`;
    
    // Save to JSON file
    try {
        const dir = path.dirname(SIZE_CHART_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(SIZE_CHART_FILE, JSON.stringify({ url: imageUrl }));
    } catch (err) {
        console.error("Failed to save size chart config", err);
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${baseUrl}/${imageUrl}` });
};

exports.getSizeChart = async (req, res) => {
    try {
        if (fs.existsSync(SIZE_CHART_FILE)) {
            const data = JSON.parse(fs.readFileSync(SIZE_CHART_FILE));
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            return res.json({ url: `${baseUrl}/${data.url}` });
        }
        res.status(404).json({ error: 'Size chart not found' });
    } catch (err) {
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
