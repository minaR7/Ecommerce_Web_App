const sql = require('mssql');

// Get all sizes
exports.getSizes = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        size_id,
        name
      FROM product_sizes
      ORDER BY name ASC
    `);
    
    //     const result = await sql.query(`
      // SELECT 
      //   size_id,
      //   name,
    // sort_order as sortOrder,
    // created_at as createdAt,
    // updated_at as updatedAt
      // FROM product_sizes
      // ORDER BY sort_order ASC, name ASC
    //`);
  
    res.status(200).json(result.recordset);

  } catch (err) {
    console.error('Error fetching sizes:', err);
    res.status(500).json({ error: `Server error ${err}` });
  }
};

// Get size by ID
exports.getSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query`
      SELECT 
        size_id,
        name
      FROM product_sizes
      WHERE size_id = ${id}
    `;
        // ,
    // sort_order as sortOrder,
    // created_at as createdAt,
    // updated_at as updatedAt
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Size not found' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching size:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new size
exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;
    // const { name, sortOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Size name is required' });
    }

    // Check if size already exists
    const exists = await sql.query`
      SELECT size_id FROM product_sizes WHERE LOWER(name) = LOWER(${name})
    `;
    
    if (exists.recordset.length > 0) {
      return res.status(409).json({ error: 'Size already exists' });
    }

    // const result = await sql.query`
    //   INSERT INTO product_sizes (name, sort_order, created_at, updated_at)
    //   VALUES (${name}, ${sortOrder || 0}, GETDATE(), GETDATE());
      
    //   SELECT 
    //     size_id,
    //     name,
    //     sort_order as sortOrder,
    //     created_at as createdAt,
    //     updated_at as updatedAt
    //   FROM product_sizes WHERE size_id = SCOPE_IDENTITY();
    // `;
    
    const result = await sql.query`
      INSERT INTO product_sizes (name)
      VALUES (${name});
      
      SELECT 
        size_id,
        name
      FROM product_sizes WHERE size_id = SCOPE_IDENTITY();
    `;

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating size:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update size
exports.updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    // const { name, sortOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Size name is required' });
    }

    // Check if size exists
    const exists = await sql.query`
      SELECT size_id FROM product_sizes WHERE size_id = ${id}
    `;
    
    if (exists.recordset.length === 0) {
      return res.status(404).json({ error: 'Size not found' });
    }

    // Check if new name already exists (excluding current size)
    const nameExists = await sql.query`
      SELECT size_id FROM product_sizes 
      WHERE LOWER(name) = LOWER(${name}) AND size_id != ${id}
    `;
    
    if (nameExists.recordset.length > 0) {
      return res.status(409).json({ error: 'Size name already exists' });
    }

    // const result = await sql.query`
    //   UPDATE product_sizes
    //   SET name = ${name}, sort_order = ${sortOrder || 0}, updated_at = GETDATE()
    //   WHERE size_id = ${id};
      
    //   SELECT 
    //     size_id,
    //     name,
    //     sort_order as sortOrder,
    //     created_at as createdAt,
    //     updated_at as updatedAt
    //   FROM product_sizes WHERE size_id = ${id};
    // `;

    const result = await sql.query`
      UPDATE product_sizes
      SET name = ${name}
      WHERE size_id = ${id};
      
      SELECT 
        size_id,
        name
      FROM product_sizes WHERE size_id = ${id};
    `;
    
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating size:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete size
exports.deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if size is being used in products
    const used = await sql.query`
      SELECT COUNT(*) as count FROM product_variants WHERE size_id = ${id}
    `;
    
    if (used.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Size is being used in products and cannot be deleted' });
    }

    const result = await sql.query`
      DELETE FROM product_sizes WHERE size_id = ${id}
    `;
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Size not found' });
    }
    
    res.status(200).json({ message: 'Size deleted successfully' });
  } catch (err) {
    console.error('Error deleting size:', err);
    res.status(500).json({ error: 'Server error' });
  }
};