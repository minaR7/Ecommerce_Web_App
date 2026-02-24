const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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
                cover_img: subcategory.cover_img ? `${baseUrl}/${subcategory.cover_img}` : null
            }));
            
            res.status(200).json(modifiedSubcategories);
        } else {
            // Otherwise return all subcategories
            const result = await sql.query`SELECT * FROM subcategories`;
            // res.json(result.recordset);
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const modifiedSubcategories = result.recordset.map((subcategory) => ({
                ...subcategory,
                cover_img: subcategory.cover_img ? `${baseUrl}/${subcategory.cover_img}` : null
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
        res.status(500).json({ error: `Server error ${err}` });
    }
};

// POST new subcategory
exports.createSubcategory = async (req, res) => {
    const { category_id, name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Subcategory name is required' });

    try {
        let imagePath = null;
        if (req.file) {
            imagePath = `assets/uploads/subcategories/${req.file.filename}`;
        }
        await sql.query`
            INSERT INTO subcategories (category_id, name, description, cover_img)
            VALUES (${category_id}, ${name}, ${description}, ${imagePath})
        `;
        res.status(201).json({ message: 'Subcategory created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
    }
};

// PUT update subcategory
exports.updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, cover_img, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Subcategory name is required' });

    try {
        const request1 = new sql.Request();
        request1.input('id', sql.Int, id);

        const existingResult = await request1.query(`
        SELECT cover_img FROM subcategories WHERE subcategory_id = @id
        `);

        if (!existingResult.recordset.length) {
        return res.status(404).json({ error: 'Subcategory not found' });
        }

        const existingImage = existingResult.recordset[0].cover_img;
        
        let imagePath = existingImage; 

        if (req.file) {
            imagePath = `assets/uploads/subcategories/${req.file.filename}`;
            if (existingImage) {
                const oldPath = path.join(__dirname, '../', existingImage);
                if (fs.existsSync(oldPath)) {
                  fs.unlinkSync(oldPath);
                }
              }
        } else if (cover_img || image) {
            const val = cover_img || image;
            imagePath = typeof val === 'string' && val.includes('/assets/')
                ? val.replace(/^https?:\/\/[^/]+\/(.*)$/, '$1')
                : val || null;
        }
        else if (cover_img === null || image === null) {
            imagePath = null;
    
            if (existingImage) {
            const oldPath = path.join(__dirname, '../', existingImage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            }
        }

        const request2 = new sql.Request();
        request2.input('id', sql.Int, id);
        request2.input('name', sql.NVarChar, name);
        request2.input('description', sql.NVarChar, description);
        request2.input('img', sql.NVarChar, imagePath);

         const result = await request2.query`
            UPDATE subcategories
            SET name = @name, description = @description, cover_img = @img
            WHERE subcategory_id = @id
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json({ message: 'Subcategory updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
    }
};

// DELETE subcategory
exports.deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        request.input('id', sql.Int, id);

        await request.query`
            UPDATE products SET subcategory_id = NULL WHERE subcategory_id = @id
        `;

        const request1 = new sql.Request(transaction);
        request1.input('id', sql.Int, id);
        const existingResult = await request1.query(`
        SELECT cover_img FROM subcategories WHERE subcategory_id = @id
        `);

        if (!existingResult.recordset.length) {
        return res.status(404).json({ error: 'Subcategory not found' });
        }

        const existingImage = existingResult.recordset[0].cover_img;
        
        if (existingImage) {
            const oldPath = path.join(__dirname, '../', existingImage);
            if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            }
        }

        const result = await request.query`
            DELETE FROM subcategories WHERE subcategory_id = @id
        `;
        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        await transaction.commit();
        res.json({ message: 'Subcategory deleted' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).json({ error: `Server error ${err}` });
    }
};
