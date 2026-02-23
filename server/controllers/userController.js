const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const isValidEmailSyntax = (email) => {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const hasMxRecords = async (email) => {
  try {
    if (!isValidEmailSyntax(email)) return false;
    const domain = String(email.split('@')[1] || '').trim();
    if (!domain) return false;
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
};

const sendSignupEmail = async ({ email, first_name }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    greetingTimeout: 10000,
    tls: { rejectUnauthorized: false },
  });
  console.log(transporter)
  await transporter.sendMail({
    from: `"Elmaghrib" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to Elmaghrib`,
    text: `Hi ${first_name || ''},\n\nYour account has been created successfully.\n\n- The Elmaghrib Team`,
    html: `<p>Hi ${first_name || ''},</p><p>Your account has been created successfully.</p><p>- The Elmaghrib Team</p>`,
  });
};

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

const { notifyAdmins } = require('../services/notificationService');
exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, address, password, username, is_admin } = req.body;

  const request = new sql.Request();
  request.input('email', sql.VarChar, email);

  try {
    const deliverable = await hasMxRecords(email);
    console.log(deliverable)
    if (!deliverable) {
      return res.status(400).json({ error: 'Email is not deliverable' });
    }
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

    try {
      await notifyAdmins({
        type: 'user_registered',
        title: 'New user registered',
        message: `${email} registered`,
        meta: { userId: user_id, email }
      });
    } catch {}
    try {
      await sendSignupEmail({ email, first_name });
    } catch {}
    return res.status(201).json({ message: 'User registered successfully', user_id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUsers = async (req, res) => {
  const { admin, isAdmin } = req.query;
  const request = new sql.Request();

  let query = `
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.address, u.created_at, u.is_registered,
           c.username, c.is_admin
    FROM users u
    LEFT JOIN credentials c ON u.user_id = c.user_id
    WHERE 1=1
  `;

  if (isAdmin === 'true' || isAdmin === 'false') {
    query += ' AND u.is_registered = @is_registered';
    request.input('is_registered', sql.Bit, isAdmin === 'true' ? 1 : 0);
  }

  const adminFlag = typeof isAdmin !== 'undefined' ? isAdmin : admin;
  if (adminFlag === 'true' || adminFlag === 'false') {
    if (adminFlag === 'true') {
      query += ' AND c.is_admin = @is_admin';
      request.input('is_admin', sql.Bit, 1);
    } else {
      query += ' AND (c.is_admin = @is_admin OR c.is_admin IS NULL)';
      request.input('is_admin', sql.Bit, 0);
    }
  }

  try {
    const result = await request.query(query);
    console.log('users:', result.recordset)
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, address, is_admin } = req.body;

  const request = new sql.Request();
  request.input('id', sql.Int, id);
  request.input('first_name', sql.VarChar, first_name);
  request.input('last_name', sql.VarChar, last_name);
  request.input('email', sql.VarChar, email);
  request.input('address', sql.VarChar, address);
  request.input('is_admin', sql.Bit, is_admin);

  try {
    // Update users table
    await request.query(`
      UPDATE users
      SET first_name = @first_name, last_name = @last_name, email = @email, address = @address
      WHERE user_id = @id
    `);

    // Update credentials table (for is_admin)
    // Note: This assumes a credential record exists. If not, we might need to insert one, but for now update.
    await request.query(`
      UPDATE credentials
      SET is_admin = @is_admin
      WHERE user_id = @id
    `);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const request = new sql.Request();
  request.input('id', sql.Int, id);

  try {
    // Delete from credentials first (foreign key)
    await request.query('DELETE FROM credentials WHERE user_id = @id');
    // Delete from users
    await request.query('DELETE FROM users WHERE user_id = @id');

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at AS since,
        COUNT(o.order_id) AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.user_id
      LEFT JOIN credentials c ON c.user_id = u.user_id
      WHERE (c.is_admin = 0 OR c.is_admin IS NULL) AND u.is_registered = 1
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.created_at
      ORDER BY total_spent DESC
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  const request = new sql.Request();
  request.input('identifier', sql.VarChar, identifier);

  try {
    if (String(identifier).includes('@')) {
      const deliverable = await hasMxRecords(identifier);
      
    console.log(deliverable)
      if (!deliverable) {
        return res.status(400).json({ error: 'Email is not deliverable' });
      }
    }
    const userResult = await request.query(`
      SELECT u.user_id, u.email, u.is_registered, c.password, c.username, c.is_admin
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.email = @identifier OR c.username = @identifier
    `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.recordset[0];

    const isAdminRequest =
      (req.headers['x-admin-request'] === 'true') ||
      (req.headers['x-admin-request'] === '1');
    if (isAdminRequest && !user.is_admin) {
      return res.status(401).json({ error: 'Admin access only' });
    }

    if (!user.is_registered) {
      return res.status(403).json({ error: 'User is not registered' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const data = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    }
    const token = jwt.sign({ id: user.user_id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({
      message: 'Login successful',
      data,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

