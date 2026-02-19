const sql = require('mssql');

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
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, img, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    try {
        let imagePath = null;
        if (req.file) {
            imagePath = `assets/uploads/categories/${req.file.filename}`;
        } else if (img || image) {
            const val = img || image;
            imagePath = typeof val === 'string' && val.includes('/assets/')
                ? val.replace(/^https?:\/\/[^/]+\/(.*)$/, '$1')
                : val || null;
        }

        const result = await sql.query`
            UPDATE categories
            SET name = ${name}, description = ${description}
            WHERE category_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        if (imagePath !== null) {
            await sql.query`
                UPDATE categories SET img = ${imagePath} WHERE category_id = ${id}
            `;
        }
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

        await request.query`
            UPDATE products
            SET subcategory_id = NULL, category_id = NULL
            WHERE category_id = ${id}
        `;
        await request.query`
            DELETE FROM subcategories WHERE category_id = ${id}
        `;
        const result = await request.query`
            DELETE FROM categories WHERE category_id = ${id}
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
