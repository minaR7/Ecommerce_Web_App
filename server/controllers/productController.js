const sql = require('mssql');
const path = require('path');
const fs = require('fs');

const SIZE_CHARTS_FILE = path.join(__dirname, '../data/sizeCharts.json');

const ensureDataDir = () => {
  const dir = path.dirname(SIZE_CHARTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const loadSizeChartMap = () => {
  try {
    const raw = fs.readFileSync(SIZE_CHARTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveSizeChartForProduct = (productId, urlPath) => {
  ensureDataDir();
  const map = loadSizeChartMap();
  map[String(productId)] = urlPath;
  fs.writeFileSync(SIZE_CHARTS_FILE, JSON.stringify(map, null, 2));
};

const deleteSizeChartForProduct = (productId) => {
  ensureDataDir();
  const map = loadSizeChartMap();
  const key = String(productId);
  const existing = map[key];
  if (existing) {
    try {
      const abs = path.join(__dirname, '..', existing);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {}
  }
  delete map[key];
  fs.writeFileSync(SIZE_CHARTS_FILE, JSON.stringify(map, null, 2));
};

const deleteFileSafe = (relPath) => {
  try {
    if (!relPath) return;
    const abs = path.join(__dirname, '..', relPath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};
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
                p.category_id,
                p.subcategory_id,
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
                ca.colors,
                sa.sizes
            FROM products p
            LEFT JOIN reviews r ON p.product_id = r.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN subcategories sc ON p.subcategory_id = sc.subcategory_id
            LEFT JOIN (
                SELECT t.product_id, STRING_AGG(t.name, ',') AS colors
                FROM (
                    SELECT DISTINCT v.product_id, pc.name
                    FROM product_variants v
                    JOIN product_colors pc ON v.color_id = pc.color_id
                    WHERE v.color_id IS NOT NULL
                ) t
                GROUP BY t.product_id
            ) ca ON ca.product_id = p.product_id
            LEFT JOIN (
                SELECT t2.product_id, STRING_AGG(t2.name, ',') AS sizes
                FROM (
                    SELECT DISTINCT v.product_id, ps.name
                    FROM product_variants v
                    JOIN product_sizes ps ON v.size_id = ps.size_id
                    WHERE v.size_id IS NOT NULL
                ) t2
                GROUP BY t2.product_id
            ) sa ON sa.product_id = p.product_id
        `;

        if (subcategory) {
            query += ` WHERE p.subcategory_id = ${subcategory}`;
        }

        query += ' GROUP BY p.product_id, p.category_id, p.subcategory_id, p.name, p.description, p.price, p.stock_quantity, p.cover_img, p.images, p.discount_percentage, c.name, sc.name, ca.colors, sa.sizes';

        const result = await sql.query(query);
         // res.json(result.recordset);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const sizeChartMap = loadSizeChartMap();
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
            const sizesArray = product.sizes ? product.sizes.split(',') : [];
            const scRel = sizeChartMap[String(product.product_id)];
            return (
            {
                ...product,
                cover_img: `${baseUrl}/${product.cover_img}`,  // Append base URL to each subcategory's cover_img
                discounted_price: discountedPrice,
                slide_images: slideImages,
                colors: colorsArray,
                sizes: sizesArray,
                size_chart: scRel ? `${baseUrl}/${scRel}` : null
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

      const sizeChartMap = loadSizeChartMap();
      const scRel = sizeChartMap[String(product.product_id)];

      // 4. Return product with variant details
      res.json({
        ...product,
        cover_img: `${baseUrl}/${product.cover_img}`,
        // slide_images: product.images.map(img => `${baseUrl}/${img}`),
        slide_images: (() => {
          try {
            const arr = product.images ? JSON.parse(product.images) : [];
            return Array.isArray(arr) ? arr.map(img => `${baseUrl}/${String(img).replace(/^\/+/, '')}`) : [];
          } catch {
            return [];
          }
        })(),
        avg_rating: parseFloat(product.avg_rating || 0).toFixed(1),
        discounted_price: discountedPrice,
        variants: variantsResult.recordset,
        size_chart: scRel ? `${baseUrl}/${scRel}` : null,
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
    const files = req.files || {};
    const imageFiles = files.images || [];
    const coverFiles = files.cover_img || [];
    const imagePaths = imageFiles.map(f => `assets/uploads/products/${f.filename}`);
    const cover_img = coverFiles[0] ? `assets/uploads/products/${coverFiles[0].filename}` : null;
    if (imagePaths.length < 1) {
        return res.status(400).json({ error: 'At least one product image is required' });
    }
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

        const scFiles = (files.size_chart) ? files.size_chart : [];
        if (Array.isArray(scFiles) && scFiles[0]) {
            const scPath = `assets/uploads/size-charts/${scFiles[0].filename}`;
            saveSizeChartForProduct(productId, scPath);
        }

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

// PUT update product (also reconciles variants)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    let { subcategory_id, name, description, price, stock_quantity, sizes, colors, cover_img: coverImgField, size_chart: sizeChartField } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });

    // Parse arrays if needed
    try { if (typeof sizes === 'string') sizes = JSON.parse(sizes); } catch (e) { /* keep as is */ }
    try { if (typeof colors === 'string') colors = JSON.parse(colors); } catch (e) { /* keep as is */ }
    if (!Array.isArray(sizes)) sizes = sizes ? [sizes] : [];
    if (!Array.isArray(colors)) colors = colors ? [colors] : [];

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Images update (support removal of existing + add new)
        let images_json_update = null;
        const files = req.files || {};
        const imageFiles = files.images || [];
        const coverFiles = files.cover_img || [];
        // Load current images
        const mediaRes = await request.query`SELECT images FROM products WHERE product_id = ${id}`;
        let currentImages = [];
        try { currentImages = mediaRes.recordset[0]?.images ? JSON.parse(mediaRes.recordset[0].images) : []; } catch { currentImages = []; }
        // Parse keep list from body (if provided)
        let keepRel = null;
        if (req.body.images_keep) {
            try {
                const keepArr = typeof req.body.images_keep === 'string' ? JSON.parse(req.body.images_keep) : req.body.images_keep;
                if (Array.isArray(keepArr)) {
                    keepRel = keepArr.map(v => {
                        if (typeof v !== 'string') return null;
                        return v.replace(/^https?:\/\/[^/]+\/(.*)$/, '$1');
                    }).filter(Boolean);
                }
            } catch { keepRel = null; }
        }
        const newImagePaths = imageFiles.map(f => `assets/uploads/products/${f.filename}`);
        if (keepRel || newImagePaths.length > 0) {
            const finalImages = [...(keepRel || currentImages), ...newImagePaths];
            // Delete removed files if keepRel provided
            if (keepRel) {
                for (const img of currentImages) {
                    if (!keepRel.includes(img)) {
                        try {
                            const abs = require('path').join(__dirname, '..', img);
                            if (fs.existsSync(abs)) fs.unlinkSync(abs);
                        } catch {}
                    }
                }
            }
            images_json_update = JSON.stringify(finalImages);
        }
        // Fetch current cover image
        const currentCoverRes = await request.query`SELECT cover_img FROM products WHERE product_id = ${id}`;
        const currentCover = currentCoverRes.recordset[0]?.cover_img || null;
        // Handle cover image removal/replacement
        if (coverImgField === 'null') {
            deleteFileSafe(currentCover);
            await request.query`UPDATE products SET cover_img = ${null} WHERE product_id = ${id}`;
        } else if (coverFiles.length > 0) {
            deleteFileSafe(currentCover);
            const newCover = `assets/uploads/products/${coverFiles[0].filename}`;
            await request.query`UPDATE products SET cover_img = ${newCover} WHERE product_id = ${id}`;
        }

        // Update product base fields (+ images if present)
        if (images_json_update !== null) {
            await request.query`
                UPDATE products
                SET subcategory_id = ${subcategory_id}, name = ${name}, description = ${description},
                    price = ${price}, stock_quantity = ${stock_quantity},
                    images = ${images_json_update}
                WHERE product_id = ${id}
            `;
        } else {
            await request.query`
                UPDATE products
                SET subcategory_id = ${subcategory_id}, name = ${name}, description = ${description},
                    price = ${price}, stock_quantity = ${stock_quantity}
                WHERE product_id = ${id}
            `;
        }

        // Handle size chart remove/replace
        const scFilesUpd = (files.size_chart) ? files.size_chart : [];
        const sizeChartMap = loadSizeChartMap();
        const existingSC = sizeChartMap[String(id)];
        if (sizeChartField === 'null') {
            if (existingSC) {
                const absSc = require('path').join(__dirname, '..', existingSC);
                if (fs.existsSync(absSc)) fs.unlinkSync(absSc);
            }
            deleteSizeChartForProduct(id);
        } else if (Array.isArray(scFilesUpd) && scFilesUpd[0]) {
            if (existingSC) {
                const absSc = require('path').join(__dirname, '..', existingSC);
                if (fs.existsSync(absSc)) fs.unlinkSync(absSc);
            }
            const scPath = `assets/uploads/size-charts/${scFilesUpd[0].filename}`;
            saveSizeChartForProduct(id, scPath);
        }

        // Build desired variants from provided colors/sizes
        let colorIds = [];
        if (colors.length > 0) {
            const allColors = await request.query`SELECT color_id, name FROM product_colors`;
            const colorMap = new Map(allColors.recordset.map(c => [c.name.toLowerCase(), c.color_id]));
            colorIds = colors.map(n => colorMap.get(String(n).toLowerCase())).filter(cid => cid);
        }

        let sizeIds = [];
        if (sizes.length > 0) {
            const allSizes = await request.query`SELECT size_id, name FROM product_sizes`;
            const sizeMap = new Map(allSizes.recordset.map(s => [s.name.toLowerCase(), s.size_id]));
            sizeIds = sizes.map(n => sizeMap.get(String(n).toLowerCase())).filter(sid => sid);
        }

        const desiredKeys = new Set();
        const desiredPairs = [];
        if (colorIds.length > 0 && sizeIds.length > 0) {
            for (const c of colorIds) for (const s of sizeIds) {
                const key = `${c}-${s}`;
                desiredKeys.add(key);
                desiredPairs.push({ color_id: c, size_id: s });
            }
        } else if (colorIds.length > 0) {
            for (const c of colorIds) {
                const key = `${c}-0`;
                desiredKeys.add(key);
                desiredPairs.push({ color_id: c, size_id: null });
            }
        } else if (sizeIds.length > 0) {
            for (const s of sizeIds) {
                const key = `0-${s}`;
                desiredKeys.add(key);
                desiredPairs.push({ color_id: null, size_id: s });
            }
        }

        // Load existing variants
        const existing = await request.query`
            SELECT variant_id, color_id, size_id
            FROM product_variants
            WHERE product_id = ${id}
        `;
        const existingRows = existing.recordset;
        const existingMap = new Map(existingRows.map(v => [`${v.color_id || 0}-${v.size_id || 0}`, v]));

        // Insert missing variants
        for (const pair of desiredPairs) {
            const key = `${pair.color_id || 0}-${pair.size_id || 0}`;
            if (!existingMap.has(key)) {
                await request.query`
                    INSERT INTO product_variants (product_id, color_id, size_id, price, image, stock_quantity)
                    VALUES (${id}, ${pair.color_id}, ${pair.size_id}, ${price}, NULL, ${stock_quantity})
                `;
            }
        }

        // Delete variants no longer desired
        for (const [key, v] of existingMap.entries()) {
            if (!desiredKeys.has(key)) {
                await request.query`
                    DELETE FROM product_variants WHERE variant_id = ${v.variant_id}
                `;
            }
        }

        await transaction.commit();
        res.json({ message: 'Product updated' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        // Load product media
        const prodRes = await request.query`
            SELECT cover_img, images FROM products WHERE product_id = ${id}
        `;
        if (prodRes.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }
        const cover = prodRes.recordset[0].cover_img || null;
        let imgs = [];
        try { imgs = prodRes.recordset[0].images ? JSON.parse(prodRes.recordset[0].images) : []; } catch { imgs = []; }
        // Delete image files
        if (cover) {
            const abs = require('path').join(__dirname, '..', cover);
            try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch {}
        }
        for (const img of imgs) {
            const abs = require('path').join(__dirname, '..', img);
            try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch {}
        }
        // Delete size chart
        deleteSizeChartForProduct(id);
        // Delete variants
        await request.query`
            DELETE FROM product_variants WHERE product_id = ${id}
        `;
        // Delete product
        const result = await request.query`
            DELETE FROM products WHERE product_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }
        await transaction.commit();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
