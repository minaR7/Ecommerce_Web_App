const sql = require('mssql');

exports.saveShipping = async (shippingData) => {
    try {
      const { orderId, shippingDetails } = shippingData;
      console.log(shippingData)
      if (!shippingDetails.city || !shippingDetails.country || !shippingDetails.phone) {
        const errorResponse = {
          success: false,
          status: 400,
          message: 'Missing required fields',
        };
        return errorResponse;
      }

      const request = new sql.Request();
      request.input('order_id', sql.Int, orderId);
      request.input('address_line1', sql.VarChar, shippingDetails.street);
      request.input('country', sql.VarChar, shippingDetails.country);
      request.input('city', sql.VarChar, shippingDetails.city);
      request.input('phone', sql.VarChar, shippingDetails.phone);

      // const shippingQuery =  await sql.query(`
      //     INSERT INTO billings (order_id, address_line1, city, country, phone) 
      //     VALUES ( ${orderId}, ${shippingDetails.street}, ${shippingDetails.city}, ${shippingDetails.country}, ${shippingDetails.phone})
      // `);
      const shippingQuery = await request.query(`
        INSERT INTO shipping (order_id, address_line1, country, city, phone) 
        VALUES (@order_id, @address_line1, @country, @city, @phone)
      `);
      console.log(`Shipping details added: ${shippingQuery}` )
      return {
        success: true,
        message: 'Shipping details saved successfully',
        data: shippingQuery
      };
      // return res.status(201).json({ message: `Shipping details added: ${result}` });

    } catch (error) {
      console.error("Shipping catch block", error);
      const errorResponse = {
        success: false,
        status: 400,
        message: `${error}`,
      };
      return errorResponse;
      // return res.status(500).json({ message: 'Server error saving shipping details' });
    }
  };