const sql = require('mssql');

exports.updateProductStock = async (cartItems) => {
  try {

    // const {shippingDetails } = cartItems;
    console.log(cartItems)
    
    for (const item of cartItems) {
      if (!cartItems.productId || !cartItems.variant || !cartItems.quantity) {
        const errorResponse = {
          success: false,
          status: 400,
          message: 'Missing required fields',
        };
        return errorResponse;
      }
    }
    
    const request = new sql.Request();

    for (const item of cartItems) {
        request.input('productId', sql.Int, item.productId)
        request.input('variantId', sql.Int, item.variant)
        request.input('quantity', sql.Int, item.quantity)
        
        const updateQuantityQuery = await request.query(`
          UPDATE ProductVariants
          SET stock_quantity = stock_quantity - @quantity
          WHERE product_id = @productId AND variant_id = @variantId
        `);

        console.log(updateQuantityQuery)
    }

    return { success: true };
  } catch (err) {
    console.error('Stock update error:', err);
    return { success: false, message: 'Failed to update product stock' };
  }
};