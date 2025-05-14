const sql = require('mssql');

// GET all subcategories
// exports.getSubcategories = async (req, res) => {
//     try {
//         const result = await sql.query`SELECT * FROM subcategories`;
//         res.json(result.recordset);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
exports.getSubcategories = async (req, res) => {
    const { category } = req.query;

    try {
        if (category) {
            // If a category name is provided, filter subcategories by it
            const result = await sql.query`
                SELECT s.*
                FROM subcategories s
                JOIN categories c ON s.category_id = c.category_id
                WHERE c.name = ${category}
            `;
            // res.json(result.recordset);
            
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            // Append base URL to each subcategory's cover_img
            const modifiedSubcategories = result.recordset.map((subcategory) => ({
                ...subcategory,
                cover_img: `${baseUrl}/${subcategory.cover_img}`
            }));
            
            res.status(200).json(modifiedSubcategories);
        } else {
            // Otherwise return all subcategories
            const result = await sql.query`SELECT * FROM subcategories`;
            // res.json(result.recordset);
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const modifiedSubcategories = result.recordset.map((subcategory) => ({
                ...subcategory,
                cover_img: `${baseUrl}/${subcategory.cover_img}`
            }));
            
            res.status(200).json(modifiedSubcategories);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
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
