const sql = require('mssql');

exports.saveBilling = async (billingData) => {
    try {
      const { orderId, billingDetails} = billingData;
      if (!billingDetails.street || !billingDetails.phone) {
        const errorResponse = {
          success: false,
          status: 400,
          message: 'Missing required fields',
        };
        return errorResponse;
      }

      const request = new sql.Request();
      request.input('order_id', sql.Int, orderId);
      request.input('address_line1', sql.VarChar, billingDetails.street);
      request.input('country', sql.VarChar, billingDetails.country);
      request.input('city', sql.VarChar, billingDetails.city);
      request.input('phone', sql.VarChar, billingDetails.phone);

      // const billingQuery =  await sql.query(`
      //     INSERT INTO billings (order_id, address_line1, city, country, phone) 
      //     VALUES ( ${orderId}, ${billingDetails.street}, ${billingDetails.city}, ${billingDetails.country}, ${billingDetails.phone})
      // `);
      const billingQuery = await request.query(`
        INSERT INTO billings (order_id, address_line1, country, city, phone) 
        VALUES (@order_id, @address_line1, @country, @city, @phone)
      `);
      
      console.log(`Billing details added: ${billingQuery}`);
      return {
        success: true,
        message: 'Shipping details saved successfully',
        data: billingQuery
      };
      // return res.status(201).json({ message: `User added: ${result}` });
    
    } catch (error) {
      console.error("Billing catch block", error);
      const errorResponse = {
        success: false,
        status: 400,
        message: `${error}`,
      };
      return errorResponse;
      // return res.status(500).json({ message: 'Server error saving user' });
    }
  };