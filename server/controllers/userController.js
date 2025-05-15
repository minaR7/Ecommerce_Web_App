const sql = require('mssql');

exports.saveUser = async (userData, calledFromCheckout = false) => {
  try {
    const { email, firstName, lastName } = userData;

    if (!email) {
      const errorResponse = {
        success: false,
        status: 400,
        message: 'Email is required.',
      };
      return calledFromCheckout ? errorResponse : errorResponse;
    }

    const request = new sql.Request();
    request.input('email', sql.VarChar, email);

    // Check if user already exists
    const existingUser = await request.query(`
      SELECT user_id FROM users WHERE email = @email
    `);

    if (existingUser.recordset.length > 0) {
      const errorResponse = {
        success: false,
        status: 409,
        message: 'User with this email already exists.',
      };
      return calledFromCheckout ? errorResponse : errorResponse;
    }

    // Insert new user
    request.input('first_name', sql.VarChar, firstName);
    request.input('last_name', sql.VarChar, lastName);
    request.input('is_registered', sql.Bit, 0);

    const result = await request.query(`
      INSERT INTO users (email, first_name, last_name, is_registered)
      OUTPUT INSERTED.user_id
      VALUES (@email, @first_name, @last_name, @is_registered)
    `);

    const successResponse = {
      success: true,
      status: 201,
      message: 'User created successfully.',
      userId: result.recordset[0].user_id,
    };

    return calledFromCheckout ? result.recordset[0] : successResponse;

  } catch (error) {
    console.error('Error saving user:', error);
    const errorResponse = {
      success: false,
      status: 500,
      message: 'Internal server error.',
    };
    return calledFromCheckout ? errorResponse : errorResponse;
  }
};
