const sql = require('mssql');

// GET all subcategories
exports.getSubcategories = async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM subcategories`;
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET single subcategory
exports.getSubcategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`SELECT * FROM subcategories WHERE subcategory_id = ${id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST new subcategory
exports.createSubcategory = async (req, res) => {
    const { category_id, name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Subcategory name is required' });

    try {
        await sql.query`
            INSERT INTO subcategories (category_id, name, description)
            VALUES (${category_id}, ${name}, ${description})
        `;
        res.status(201).json({ message: 'Subcategory created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT update subcategory
exports.updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Subcategory name is required' });

    try {
        const result = await sql.query`
            UPDATE subcategories
            SET name = ${name}, description = ${description}
            WHERE subcategory_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json({ message: 'Subcategory updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE subcategory
exports.deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query`
            DELETE FROM subcategories WHERE subcategory_id = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json({ message: 'Subcategory deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
