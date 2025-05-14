const sql = require('mssql');

// GET all categories
exports.getCategories = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM categories`;
        // res.json(result.recordset);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Append base URL to each subcategory's cover_img
        const modifiedCategories = result.recordset.map((category) => ({
            ...category,
            cover_img: `${baseUrl}/${category.img}`
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
        await sql.query`
            INSERT INTO categories (name, description)
            VALUES (${name}, ${description})
        `;
        res.status(201).json({ message: 'Category created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT update category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    try {
        const result = await sql.query`
            UPDATE categories
            SET name = ${name}, description = ${description}
            WHERE category_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category not found' });
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
    try {
        const result = await sql.query`
            DELETE FROM categories WHERE category_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
