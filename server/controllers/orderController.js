const sql = require('mssql');

exports.saveOrder = async (orderData) => {
    try {
      const { userId, totalAmount, status }  = orderData;
      if (!userId) {
        const errorResponse = {
          success: false,
          status: 400,
          message: 'User Id is required.',
        };
        return errorResponse;
      }
      if (!totalAmount) {
        const errorResponse = {
          success: false,
          status: 400,
          message: 'Total Amount is missing.',
        };
        return errorResponse;
      }
 
      // const orderQuery =  await sql.query(`
      //   INSERT INTO orders (user_id, total_amount, status) 
      //   VALUES ( ${userId}, ${totalAmount}, 'pending')
      // `);
      const request = new sql.Request();
      // Insert new order
      request.input('userId', sql.Int, userId);
      request.input('totalAmount', sql.Decimal, totalAmount);
      request.input('status', sql.VarChar, 'pending');
      request.input('payment_status', sql.VarChar, 'pending');
  
      const result = await request.query(`
        INSERT INTO orders (user_id, total_amount, status, payment_status) 
        OUTPUT INSERTED.order_id
        VALUES (@userId, @totalAmount, @status, @payment_status)
      `);
  
      const successResponse = {
        success: true,
        status: 201,
        message: 'Order added successfully.',
        orderId: result.recordset[0],
      };

      // console.log(successResponse)
      return result.recordset[0]; 

    } catch (error) {
      console.error("Order catch block", error);
      const errorResponse = {
        success: false,
        status: 400,
        message: `${error}`,
      };
      return errorResponse;
      // return res.status(500).json({ message: 'Server error saving order' });
    }
  };

exports.saveOrderItems = async (orderId, cartItems) => {
  try {
    for (const item of cartItems) {
      console.log(item)
      await sql.query`
        INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
        VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.basePrice}, GETDATE())
      `;
    }
    return { success: true };
  } catch (err) {
    console.error('Error saving order items:', err);
    return { success: false, message: err.message };
  }
};
