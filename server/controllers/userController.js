const sql = require('mssql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

      return calledFromCheckout ? existingUser.recordset[0] : errorResponse;
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

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, address, password, username, is_admin } = req.body;

  const request = new sql.Request();
  request.input('email', sql.VarChar, email);

  try {
    // Check if user already exists
    const existingUser = await request.query(
      'SELECT * FROM users WHERE email = @email'
    );

    console.log(existingUser.recordset.length > 0)
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

  // Insert into users table
    request.input('first_name', sql.VarChar, first_name)
    request.input('last_name', sql.VarChar, last_name)
    request.input('address', sql.VarChar, address)
    request.input('is_registered', sql.Bit, true)
    const userResult = await request.query(`
      INSERT INTO users (first_name, last_name, email, address, is_registered, created_at, updated_at)
      OUTPUT inserted.user_id
      VALUES (@first_name, @last_name, @email, @address, @is_registered, GETDATE(), GETDATE())
    `);

    // Insert into users table
    // const userResult = await db.query(
    //   `INSERT INTO users (first_name, last_name, email, address, is_registered, created_at, updated_at)
    //    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    //    RETURNING user_id`,
    //   [first_name, last_name, email, address, true]
    // );

    const user_id = userResult.recordset[0].user_id;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    request.input('user_id', sql.Int, user_id)
    request.input('hashedPassword', sql.VarChar, hashedPassword)
    request.input('username', sql.VarChar, username)
    request.input('is_admin', sql.Bit, is_admin)
    // Insert into credentials table
    await request.query(
      `INSERT INTO credentials (user_id, email, username, password, is_admin)
       VALUES (@user_id, @email, @username, @hashedPassword, @is_admin)`,
    );

    return res.status(201).json({ message: 'User registered successfully', user_id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUsers = async (req, res) => {
  const { registered, admin } = req.query;

  let query = `
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.address, u.created_at, u.is_registered,
           c.username, c.is_admin
    FROM users u
    LEFT JOIN credentials c ON u.user_id = c.user_id
    WHERE 1=1
  `;
  const values = [];

  if (registered === 'true') {
    query += ' AND u.is_registered = true';
  } else if (registered === 'false') {
    query += ' AND u.is_registered = false';
  }

  if (admin === 'true') {
    query += ' AND c.is_admin = true';
  } else if (admin === 'false') {
    query += ' AND (c.is_admin = false OR c.is_admin IS NULL)';
  }

  try {
    const result = await sql.query(query, values);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  const request = new sql.Request();
  request.input('identifier', sql.VarChar, identifier);

  try {
    const userResult = await request.query(`
      SELECT u.user_id, u.is_registered, c.password, c.username, c.is_admin
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.email = @identifier OR c.username = @identifier
    `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.recordset[0];

    if (!user.is_registered) {
      return res.status(403).json({ error: 'User is not registered' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // You can add JWT generation here if needed
    const data = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    }
    res.status(200).json({
      message: 'Login successful',
      data
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

