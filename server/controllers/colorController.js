const sql = require('mssql');

// Get all colors
exports.getColors = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        color_id,
        name
      FROM product_colors
      ORDER BY name ASC
    `);

    
      // hex_code as hexCode,
      // created_at as createdAt,
      // updated_at as updatedAt
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching colors:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get color by ID
exports.getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query`
      SELECT 
        color_id,
        name
      FROM product_colors
      WHERE color_id = ${id}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Color not found' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching color:', err);
    res.status(500).json({ error: `Server error ${err}` });
  }
};

// Create new color
exports.createColor = async (req, res) => {
  try {
    const { name } = req.body;
    // const { name, hexCode } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Color name is required' });
    }

    // Check if color already exists
    const exists = await sql.query`
      SELECT color_id FROM product_colors WHERE LOWER(name) = LOWER(${name})
    `;
    
    if (exists.recordset.length > 0) {
      return res.status(409).json({ error: 'Color already exists' });
    }

    // const result = await sql.query`
    //   INSERT INTO product_colors (name, hex_code, created_at, updated_at)
    //   VALUES (${name}, ${hexCode || null}, GETDATE(), GETDATE());
      
    //   SELECT 
    //     color_id,
    //     name,
    //     hex_code as hexCode,
    //     created_at as createdAt,
    //     updated_at as updatedAt
    //   FROM product_colors WHERE color_id = SCOPE_IDENTITY();
    // `;

     const result = await sql.query`
      INSERT INTO product_colors (name,t)
      VALUES (${name});
      
      SELECT 
        color_id,
        name
      FROM product_colors WHERE color_id = SCOPE_IDENTITY();
    `;
    
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating color:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update color
exports.updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    // const { name, hexCode } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Color name is required' });
    }

    // Check if color exists
    const exists = await sql.query`
      SELECT color_id FROM product_colors WHERE color_id = ${id}
    `;
    
    if (exists.recordset.length === 0) {
      return res.status(404).json({ error: 'Color not found' });
    }

    // Check if new name already exists (excluding current color)
    const nameExists = await sql.query`
      SELECT color_id FROM product_colors 
      WHERE LOWER(name) = LOWER(${name}) AND color_id != ${id}
    `;
    
    if (nameExists.recordset.length > 0) {
      return res.status(409).json({ error: 'Color name already exists' });
    }

    // const result = await sql.query`
    //   UPDATE product_colors
    //   SET name = ${name}, hex_code = ${hexCode || null}, updated_at = GETDATE()
    //   WHERE color_id = ${id};
      
    //   SELECT 
    //     color_id,
    //     name,
    //     hex_code as hexCode,
    //     created_at as createdAt,
    //     updated_at as updatedAt
    //   FROM product_colors WHERE color_id = ${id};
    // `;

    const result = await sql.query`
      UPDATE product_colors
      SET name = ${name}
      WHERE color_id = ${id};
      
      SELECT 
        color_id,
        name
      FROM product_colors WHERE color_id = ${id};
    `;
    
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating color:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete color
exports.deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if color is being used in products
    const used = await sql.query`
      SELECT COUNT(*) as count FROM product_variants WHERE color_id = ${id}
    `;
    
    if (used.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Color is being used in products and cannot be deleted' });
    }

    const result = await sql.query`
      DELETE FROM product_colors WHERE color_id = ${id}
    `;
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Color not found' });
    }
    
    res.status(200).json({ message: 'Color deleted successfully' });
  } catch (err) {
    console.error('Error deleting color:', err);
    res.status(500).json({ error: 'Server error' });
  }
};