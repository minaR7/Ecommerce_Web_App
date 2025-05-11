const sql = require('mssql');

exports.addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity, size, color } = req.body;
      if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      console.log(`Adding to cart for user ${userId}:`, req.body);
      const pool = await sql.query(`
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (${userId}, ${productId}, ${quantity})
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
    try {
        const pool = await poolPromise;
        // const result = await pool.request()
        //     .input('userId', sql.Int, userId)
        //     .query(`
        //         SELECT ci.*, p.name, p.price, p.image
        //         FROM cart_items ci
        //         JOIN products p ON ci.product_id = p.product_id
        //         WHERE ci.user_id = @userId
        //     `);
        const result = await sql.query(`
            SELECT ci.*, p.name, p.price, p.image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.user_id = ${userId}
        `)
        
        if (!result.recordset.length) {
            return res.status(404).json({ message: 'Cart is empty' });
          }
        else{
            res.status(200).json(result.recordset);
        }
          
    } catch (error) {
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
