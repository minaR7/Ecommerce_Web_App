const sql = require('mssql');

exports.addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity, variantId, cartItems } = req.body;
      console.log(userId)
      
      if (!userId || !productId || !quantity ||  !variantId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      console.log(`Adding to cart for user ${userId}:`, req.body);
      const request = new sql.Request();
      request.input('userId', sql.Int, userId);
      request.input('productId', sql.Int, productId);
      request.input('quantity', sql.Int, quantity);
      request.input('variantId', sql.Int, variantId);
      request.input('processed', sql.Bit, 0);

      await request.query(`
        INSERT INTO cart_items (user_id, product_id, quantity, variant_id, processed)
        VALUES (@userId, @productId, @quantity, @variantId, @processed)
      `);
      return res.status(200).json({ message: 'Item added to cart successfully' });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error adding to cart' });
    }
  };

exports.addBulkToCart = async (req, res) => {
    try {
      const { userId, cartItems } = req.body;
      console.log(userId)
      
      if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      for (const item of cartItems) {
      const { productId, quantity, variantId } = item;
      if (!productId || !quantity) continue;

      const checkQuery = `
        SELECT * FROM cart_items
        WHERE user_id = @userId AND product_id = @productId AND variant_id = @variantId
      `;

      const requestCheck = new sql.Request();
      requestCheck.input('userId', sql.Int, userId);
      requestCheck.input('productId', sql.Int, productId);
      requestCheck.input('variantId', sql.Int, variantId || null);

      const existingItem = await requestCheck.query(checkQuery);

      if (existingItem.recordset.length > 0) {
        // If exists, update quantity
        const existingCartItem = existingItem.recordset[0];
        const newQuantity = existingCartItem.quantity + quantity;

        const updateRequest = new sql.Request();
        updateRequest.input('newQuantity', sql.Int, newQuantity);
        updateRequest.input('cartItemId', sql.Int, existingCartItem.cart_item_id);

        await updateRequest.query(`
          UPDATE cart_items SET quantity = @newQuantity WHERE cart_item_id = @cartItemId
        `);
      } else {
        // If not exists, insert
        const insertRequest = new sql.Request();
        insertRequest.input('userId', sql.Int, userId);
        insertRequest.input('productId', sql.Int, productId);
        insertRequest.input('quantity', sql.Int, quantity);
        insertRequest.input('variantId', sql.Int, variantId || null);
        insertRequest.input('processed', sql.Bit, 0);

        await insertRequest.query(`
          INSERT INTO cart_items (user_id, product_id, quantity, variant_id, processed)
          VALUES (@userId, @productId, @quantity, @variantId, @processed)
        `);
      }
    }

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
            WHERE ci.user_id = ${userId} AND ci.processed = 0
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
            variant_id: item.variant_id,
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
  const { productId, quantity, size, color } = req.body;

  if (!productId && !quantity || !size || !color) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  let updates = [];
  if (quantity !== undefined) updates.push(`quantity = ${quantity}`);
  // if (size !== undefined) updates.push(`size = '${size}'`);
  // if (color !== undefined) updates.push(`color = '${color}'`);

  // const updateQuery = updates.join(', ');
  const updateQuery = updates;

  try {
    const result = await sql.query(`UPDATE cart_items SET ${updateQuery} WHERE cart_item_id = ${cartItemId}`);
    res.status(200).json({ message: 'Cart item updated successfully', result: result });
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

//Mark cart items as processed after order is placed
exports.markCartItemsAsProcessed = async (userId, cartItems) => {
  try {
        console.log('markCartItemsAsProcessed', userId)

    for (const item of cartItems) {
        const request = new sql.Request();
        request.input('userId', sql.Int, userId)
        request.input('cart_item_id', sql.Int, item.cart_item_id)
        // request.input('productId', sql.Int, item.product_id)
        // request.input('variantId', sql.Int, item.variant_id)

        const processCartItem = await request.query(`
          UPDATE cart_items
          SET processed = 1
          WHERE cart_item_id = @cart_item_id
        `);

        console.log(processCartItem, "processCartItem")
    }

    return { success: true, message: 'Cart Item updated' };
  } catch (err) {
    console.error('Error updating cart_items.processed:', err);
    return { success: false, message: 'Failed to mark cart items as processed' };
  }
};

exports.checkAndAdjustCartItems = async (cartItems) => {

  const adjustedCartItems = [];
  const stockMessages = [];

  try{
    for (const item of cartItems) {
    const { productId, variant_id, color, size, quantity } = item;

    // Query available stock
      const request = new sql.Request();
      request.input('variantId', sql.Int, variant_id)
      const result = await request.query(`
        SELECT stock_quantity
        FROM product_variants
        WHERE variant_id = @variantId
      `);


    console.log("resultttt", result)
    const availableStock = result.recordset[0]?.stock_quantity ?? 0;

    if (availableStock <= 0) {
      stockMessages.push(
        `Cart item with productId: ${productId}, variantId: ${variant_id}, color: ${color}, size: ${size} is out of stock.`
      );
      console.log(`Cart item with productId: ${productId}, variantId: ${variant_id}, color: ${color}, size: ${size} is out of stock.`)
      continue;
    }

    if (quantity > availableStock) {
      stockMessages.push(
        `Cart item with productId: ${productId}, variantId: ${variant_id}, color: ${color}, size: ${size} only has quantity ${availableStock}.`
      );
      console.log(`Cart item with productId: ${productId}, variantId: ${variant_id}, color: ${color}, size: ${size} only has quantity ${availableStock}.`)
      adjustedCartItems.push({ ...item, quantity: availableStock });
    } else {
      adjustedCartItems.push(item);
    }
  }

  if (adjustedCartItems.length === 0) {
    return { success: false, message: 'All items are out of stock.', stockMessages };
  }

  return { success: true, adjustedCartItems, stockMessages };
  }
  catch(error)
  {
    console.log("stokc qunaityt upodate",error)
    return { success: true, message: 'Error while checking stock quantity', };

  }
};
