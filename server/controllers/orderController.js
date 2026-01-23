const sql = require('mssql');

exports.getOrders = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        o.order_id,
        o.user_id,
        u.email,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at,
        COUNT(oi.order_item_id) AS items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
      GROUP BY o.order_id, o.user_id, u.email, o.total_amount, o.status, o.payment_status, o.created_at
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderResult = await sql.query(`
      SELECT 
        o.order_id,
        o.user_id,
        u.email,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ${id}
    `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await sql.query(`
      SELECT 
        oi.order_item_id,
        oi.product_id,
        p.name AS product_name,
        p.cover_img,
        oi.quantity,
        oi.price
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ${id}
    `);

    const shippingResult = await sql.query`
      SELECT shipping_id, address_line1, country, city, phone
      FROM shipping
      WHERE order_id = ${id}
    `;

    const billingResult = await sql.query`
      SELECT billing_id, address_line1, country, city, phone
      FROM billings
      WHERE order_id = ${id}
    `;

    const paymentResult = await sql.query`
      SELECT TOP 1 payment_id, amount, payment_method, payment_status, transaction_id, created_at
      FROM payments
      WHERE order_id = ${id}
      ORDER BY created_at DESC
    `;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const items = itemsResult.recordset.map(item => ({
      ...item,
      cover_img: item.cover_img ? `${baseUrl}/${item.cover_img}` : null
    }));

    res.status(200).json({
      ...orderResult.recordset[0],
      items,
      shipping: shippingResult.recordset[0] || null,
      billing: billingResult.recordset[0] || null,
      payment: paymentResult.recordset[0] || null,
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Server error fetching order details' });
  }
};

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
