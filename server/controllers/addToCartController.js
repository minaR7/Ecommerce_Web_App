const sql = require('mssql');

exports.addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity, variantId } = req.body;
      console.log(userId, productId, quantity, variantId )
      if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      console.log(`Adding to cart for user ${userId}:`, req.body);
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('productId', sql.Int, productId);
      request.input('quantity', sql.Int, quantity);
      request.input('variantId', sql.Int, variantId);

      await request.query(`
        INSERT INTO cart_items (user_id, product_id, quantity, variant_id)
        VALUES (@userId, @productId, @quantity, @variantId)
      `);

      return res.status(200).json({ message: 'Item added to cart successfully' });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error adding to cart' });
    }
  };


// Get cart
exports.getCart = async (req, res) => {
    const { userId } = req.params;
    console.log(userId)
    try {
        const result = await sql.query(`
            SELECT 
              ci.cart_item_id,
              ci.quantity,
              ci.user_id,
              p.product_id,
              p.name,
              p.cover_img,
              p.price AS base_price,
              v.variant_id,
              v.size_id,
              v.color_id,
              c.name AS color,
              s.name AS size
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN product_variants v ON ci.variant_id = v.variant_id
            LEFT JOIN product_colors c ON v.color_id = c.color_id
            LEFT JOIN product_sizes s ON v.size_id = s.size_id
            WHERE ci.user_id = ${userId}
        `)
        
        if (!result.recordset.length) {
            return res.status(404).json({ message: 'Cart is empty' });
          }
        else{
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          const modifiedResponse = result.recordset.map((item) => ({
            name: item.name,
            size: item.size,
            color: item.color,
            cart_item_id: item.cart_item_id,
            basePrice: item.base_price,
            productId: item.product_id,
            quantity: item.quantity,
            coverImg: `${baseUrl}/${item.cover_img}`
          }));
          res.status(200).json(modifiedResponse);
        }
          
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

//Update cart
exports.updateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity, size, color } = req.body;

  if (!quantity && !size && !color) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  let updates = [];
  if (quantity !== undefined) updates.push(`quantity = ${quantity}`);
  // if (size !== undefined) updates.push(`size = '${size}'`);
  // if (color !== undefined) updates.push(`color = '${color}'`);

  // const updateQuery = updates.join(', ');
  const updateQuery = updates;

  try {
    await sql.query(`UPDATE cart_items SET ${updateQuery} WHERE cart_item_id = ${cartItemId}`);
    res.status(200).json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error updating cart item' });
  }
};

// Remove item
exports.removeFromCart = async (req, res) => {
    const { cartItemId } = req.params;
    try {
        const pool = await sql.query(`DELETE FROM cart_items WHERE cart_item_id = ${cartItemId}`);
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
