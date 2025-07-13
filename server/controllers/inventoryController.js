const sql = require('mssql');

exports.updateProductStock = async (cartItems) => {
  try {
    console.log("updateProductStock");
    
    for (const item of cartItems) {
      if (!item.productId || !item.variant_id || !item.quantity) {
        return {
          success: false,
          status: 400,
          message: 'Missing required fields',
        };
      }
    }

    for (const item of cartItems) {
      const request = new sql.Request(); // Create new request inside the loop

      // request.input('productId', sql.Int, item.productId);
      request.input('variantId', sql.Int, item.variant_id);
      request.input('quantity', sql.Int, item.quantity);

      const updateQuantityQuery = await request.query(`
        UPDATE product_variants
        SET stock_quantity = stock_quantity - @quantity
        WHERE variant_id = @variantId
      `);

      console.log(updateQuantityQuery, "Stock updated");
    }

    return { success: true };
  } catch (err) {
    console.error('Stock update error:', err);
    return { success: false, message: 'Failed to update product stock' };
  }
};


// exports.updateProductStock = async (cartItems) => {
//   try {
//     if (!Array.isArray(cartItems) || cartItems.length === 0) {
//       return { success: false, message: 'Cart is empty' };
//     }

//     for (const item of cartItems) {
//       if (!item.productId || !item.variant_id || !item.quantity) {
//         return {
//           success: false,
//           status: 400,
//           message: 'Missing required fields in one or more cart items',
//         };
//       }
//     }

//     const valuesClause = cartItems
//       .map(
//         (item, index) =>
//           `(@productId${index}, @variantId${index}, @quantity${index})`
//       )
//       .join(',\n');

//     const query = `
//       WITH StockUpdate (product_id, variant_id, quantity) AS (
//         VALUES
//         ${valuesClause}
//       )
//       UPDATE pv
//       SET pv.stock_quantity = pv.stock_quantity - su.quantity
//       FROM product_variants pv
//       INNER JOIN StockUpdate su
//         ON pv.product_id = su.product_id AND pv.variant_id = su.variant_id
//     `;

//     const request = new sql.Request();

//     cartItems.forEach((item, index) => {
//       request.input(`productId${index}`, sql.Int, item.productId);
//       request.input(`variantId${index}`, sql.Int, item.variant_id);
//       request.input(`quantity${index}`, sql.Int, item.quantity);
//     });

//     await request.query(query);

//     return { success: true };
//   } catch (err) {
//     console.error('Bulk stock update error:', err);
//     return { success: false, message: 'Failed to update product stock' };
//   }
// };
