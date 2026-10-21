const sql = require('mssql');
const { notifyAdmins } = require('../services/notificationService');

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
      const remainRes = await request.query(`
        SELECT pv.stock_quantity, pv.product_id, pv.variant_id, p.name,
               pc.name AS color, ps.name AS size
        FROM product_variants pv
        JOIN products p ON p.product_id = pv.product_id
        LEFT JOIN product_colors pc ON pc.color_id = pv.color_id
        LEFT JOIN product_sizes ps ON ps.size_id = pv.size_id
        WHERE pv.variant_id = @variantId
      `);
      if (remainRes.recordset.length > 0) {
        const r = remainRes.recordset[0];
        if (Number(r.stock_quantity) <= 5) {
          try {
            // Shop-staff wording: name the colour/size, not the internal variant id.
            const option = [r.color, r.size ? `size ${r.size}` : null].filter(Boolean).join(', ');
            const left = Math.max(0, Number(r.stock_quantity) || 0);
            await notifyAdmins({
              type: 'stock_low',
              title: left === 0 ? 'Sold out' : 'Stock running low',
              message: `${r.name}${option ? ` (${option})` : ''}: ${left === 0 ? 'sold out' : `only ${left} left`}.`,
              meta: { productId: r.product_id, variantId: r.variant_id, color: r.color, size: r.size, stock: left }
            });
          } catch {}
        }
      }
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
