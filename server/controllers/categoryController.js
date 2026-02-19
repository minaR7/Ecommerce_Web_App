const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// GET all categories
exports.getCategories = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM categories`;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const modifiedCategories = result.recordset.map((category) => ({
            ...category,
            cover_img: category.img ? `${baseUrl}/${category.img}` : null
        }));
        
        res.status(200).json(modifiedCategories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET single category
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM categories WHERE category_id = ${id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST new category
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    try {

        let imagePath = null;
    
        if (req.file) {
          imagePath = `assets/uploads/categories/${req.file.filename}`;
        }
    
        await sql.query`
          INSERT INTO categories (name, description, img)
          VALUES (${name}, ${description}, ${imagePath})
        `;

        // await sql.query`
        //     INSERT INTO categories (name, description)
        //     VALUES (${name}, ${description})
        // `;
        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT update category
// exports.updateCategory = async (req, res) => {
//     const { id } = req.params;
//     const { name, description, img, image } = req.body;
//     if (!name) return res.status(400).json({ error: 'Category name is required' });

//     try {
//         let imagePath = null;
//         if (req.file) {
//             imagePath = `assets/uploads/categories/${req.file.filename}`;
//         } else if (img || image) {
//             const val = img || image;
//             imagePath = typeof val === 'string' && val.includes('/assets/')
//                 ? val.replace(/^https?:\/\/[^/]+\/(.*)$/, '$1')
//                 : val || null;
//         }
//          // 3️⃣ If frontend explicitly sends null
//         else if (img === null || image === null) {
//            imagePath = null;

//         if (existingImage) {
//             const oldPath = path.join(__dirname, '../', existingImage);
//             if (fs.existsSync(oldPath)) {
//             fs.unlinkSync(oldPath);
//             }
//         }
//         }

//         const result = await sql.query`
//             UPDATE categories
//             SET name = ${name}, description = ${description}
//             WHERE category_id = ${id}
//         `;
//         if (result.rowsAffected[0] === 0) {
//             return res.status(404).json({ error: 'Category not found' });
//         }
//         if (imagePath !== null) {
//             await sql.query`
//                 UPDATE categories SET img = ${imagePath} WHERE category_id = ${id}
//             `;
//         }
//         res.json({ message: 'Category updated' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// PUT update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, img, image } = req.body;

  if (!name)
    return res.status(400).json({ error: 'Category name is required' });

  try {
    // 1️⃣ Get existing category
    const request1 = new sql.Request();
    request1.input('id', sql.Int, id);

    const existingResult = await request1.query(`
      SELECT img FROM categories WHERE category_id = @id
    `);

    if (!existingResult.recordset.length) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const existingImage = existingResult.recordset[0].img;
    let imagePath = existingImage; // default = keep existing

    // 2️⃣ If new file uploaded
    if (req.file) {
      imagePath = `assets/uploads/categories/${req.file.filename}`;

      // delete old file if exists
      if (existingImage) {
        const oldPath = path.join(__dirname, '../', existingImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 3️⃣ If frontend explicitly sends null
    else if (img === null || image === null) {
      imagePath = null;

      if (existingImage) {
        const oldPath = path.join(__dirname, '../', existingImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // 4️⃣ If frontend sends image string
    else if (img || image) {
      const val = img || image;

      imagePath =
        typeof val === 'string' && val.includes('/assets/')
          ? val.replace(/^https?:\/\/[^/]+\/(.*)$/, '$1')
          : val;
    }

    // 5️⃣ Update everything in ONE query
    const request2 = new sql.Request();
    request2.input('id', sql.Int, id);
    request2.input('name', sql.NVarChar, name);
    request2.input('description', sql.NVarChar, description);
    request2.input('img', sql.NVarChar, imagePath);

    await request2.query(`
      UPDATE categories
      SET name = @name,
          description = @description,
          img = @img,
          updated_at = GETDATE()
      WHERE category_id = @id
    `);

    res.json({ message: 'Category updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        request.input('id', sql.Int, id);
        
        await request.query`
            UPDATE products
            SET subcategory_id = NULL, category_id = NULL
            WHERE category_id = @id
        `;
        await request.query`
            DELETE FROM subcategories WHERE category_id = @id
        `;
        const result = await request.query`
            DELETE FROM categories WHERE category_id = @id
        `;
        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Category not found' });
        }
        await transaction.commit();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
