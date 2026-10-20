
const sql = require('mssql');

// Get all pages (for admin list)
exports.getPages = async (req, res) => {
    try {
        const query = 'SELECT page_id, slug, title, updated_at FROM pages';
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching pages:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single page by slug (for client and admin editor)
exports.getPageBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const request = new sql.Request();
        request.input('slug', sql.NVarChar, slug);
        const query = 'SELECT * FROM pages WHERE slug = @slug';
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching page:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update page content
exports.updatePage = async (req, res) => {
    const { slug } = req.params;
    const { content, title } = req.body;
    
    try {
        const request = new sql.Request();
        request.input('slug', sql.NVarChar, slug);
        request.input('content', sql.NVarChar, content);
        request.input('title', sql.NVarChar, title);
        
        const query = `
            UPDATE pages 
            SET content = @content, title = ISNULL(@title, title), updated_at = GETDATE() 
            WHERE slug = @slug;
            
            SELECT * FROM pages WHERE slug = @slug;
        `;
        
        const result = await request.query(query);
        
        if ((result.rowsAffected[0] || 0) === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error updating page:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new page
exports.createPage = async (req, res) => {
    const { title, content, slug } = req.body;
    
    if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
    }

    try {
        const request = new sql.Request();
        request.input('title', sql.NVarChar, title);
        request.input('slug', sql.NVarChar, slug);
        request.input('content', sql.NVarChar, content);
        
        const query = `
            INSERT INTO pages (title, slug, content)
            OUTPUT INSERTED.*
            VALUES (@title, @slug, @content)
        `;
        
        const result = await request.query(query);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error creating page:', err);
        if (err.number === 2627) { // Unique constraint violation
            return res.status(400).json({ error: 'Slug already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deletePage = async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, Number(id));
        const result = await request.query('DELETE FROM pages WHERE page_id = @id');
        if ((result.rowsAffected[0] || 0) === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.status(200).json({ message: 'Page deleted' });
    } catch (err) {
        console.error('Error deleting page:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
