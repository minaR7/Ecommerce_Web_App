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

const makeTransporter = () =>
{
  // ⚠️ Default is SMTP_TLS_STRICT = FALSE as a TEMPORARY workaround because
  // the TLS certificate on mail.Elmaghrib.com:465 is expired.  This means mail
  // delivery works RIGHT NOW without any Plesk env var, but the connection does
  // NOT validate the mail server's TLS certificate chain.
  //
  // HOW TO RE-ENABLE SECURITY after the mail cert is renewed:
  //   (a) set env SMTP_TLS_STRICT=true in Plesk Node.js env vars, OR
  //   (b) flip the default line below from `false` back to `true`.
  const strictTls =
    process.env.SMTP_TLS_STRICT === undefined
      ? false
      : String(process.env.SMTP_TLS_STRICT).toLowerCase() !== 'false';

  if (process.env.NODE_ENV !== 'production') {
    console.log({
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
      SMTP_TLS_STRICT: strictTls,
    });
  }

  // When not strict: fully neutralise TLS cert validation (both Node flags AND
  // the explicit checkServerIdentity hook).  Node/tls on newer versions calls
  // checkServerIdentity and throws "certificate has expired" for expired certs
  // EVEN WHEN rejectUnauthorized:false — overriding the hook is the nuclear
  // "allow any cert including expired / self-signed / wrong-hostname" switch.
  const tlsOptions = strictTls
    ? { rejectUnauthorized: true }
    : {
        rejectUnauthorized: false,
        minVersion: 'TLSv1',
        checkServerIdentity: () => undefined,
      };

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    // Port 465 = implicit TLS (secure:true). Port 587 = STARTTLS (secure:false).
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    tls: tlsOptions,
  });
}

// const makeTransporter = () => {
//   return nodemailer.createTransport({
//     host: 'elmaghrib.com',
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },

//     connectionTimeout: 15000,
//     greetingTimeout: 15000,
//     socketTimeout: 15000,

//     logger: true,
//     debug: true,
//   });
// };

const sendSignupEmail = async ({ email, first_name }) => {
  const transporter = makeTransporter();
  await transporter.sendMail({
    from: `"Elmaghrib" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to Elmaghrib`,
    text: `Hi ${first_name || ''},\n\nYour account has been created successfully.\n\n- The Elmaghrib Team`,
    html: `<p>Hi ${first_name || ''},</p><p>Your account has been created successfully.</p><p>- The Elmaghrib Team</p>`,
  });
};

const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  const transporter = makeTransporter();
  // await transporter.verify();

  // NOTE: we intentionally do NOT call transporter.verify() here.
  // opens a separate test connection and throws eagerly when the SMTP server's
  // TLS certificate has expired  .sendMail() will use
  // the same connection pool internally but lets us handle the error on the
  // *actual* send, and more importantly lets sendPasswordResetEmail succeed
  // when the caller has opted into SMTP_TLS_STRICT=false.
  const info = await transporter.sendMail({
    from: `"Elmaghrib" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your Elmaghrib password',
    text: `We received a request to reset your password.\n\nReset it here (link valid for 30 minutes):\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.\n\n- The Elmaghrib Team`,
    html: `
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}">
          Click here to reset your password
        </a>
        (link valid for 30 minutes).
      </p>
      <p>
        If you didn't request this, you can safely ignore this email.
      </p>
      <p>- The Elmaghrib Team</p>
    `,
  });
 console.log('[sendPasswordResetEmail] sent:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[sendPasswordResetEmail] sent:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  }
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

exports.checkEmail = async (req, res) => {
  try {
    const raw = (req.query.email || req.body.email || '').trim();
    if (!raw) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const email = raw.toLowerCase();
    const syntaxValid = isValidEmailSyntax(email);
    let deliverable = false;
    if (syntaxValid) {
      deliverable = await hasMxRecords(email);
    }
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const existing = await request.query(`SELECT TOP 1 u.user_id, u.email FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.email = @email`);
    const available = existing.recordset.length === 0;
    return res.status(200).json({
      ok: syntaxValid && deliverable && available,
      syntaxValid,
      deliverable,
      available,
    });
  } catch (err) {
    console.error('Error checking email:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, address, password, username } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const request = new sql.Request();
  request.input('email', sql.VarChar, email);

  try {
    const deliverable = await hasMxRecords(email);
    console.log(deliverable)
    if (!deliverable) {
      return res.status(400).json({ error: 'Email is not deliverable' });
    }
    // Check if user already exists
    const existingUser = await request.query(`
      SELECT TOP 1
        user_id,
        email,
        first_name,
        last_name,
        address,
        is_registered
      FROM users
      WHERE email = @email
    `);

    //USER EXISTS
    console.log(existingUser.recordset.length > 0)
    if (existingUser.recordset.length > 0) {
      const user = existingUser.recordset[0];
      const user_id = user.user_id;

      console.log('User already exists:', user_id);

      // Check whether credentials already exist
      const credentialsRequest = new sql.Request();

      credentialsRequest.input(
        'user_id',
        sql.Int,
        user_id
      );

      const existingCredentials =
        await credentialsRequest.query(`
          SELECT TOP 1 user_id
          FROM credentials
          WHERE user_id = @user_id
        `);

      // --------------------------------------------------
      // 2A. User AND credentials both exist
      // --------------------------------------------------

      if (existingCredentials.recordset.length > 0) {
        return res.status(400).json({
          error: 'User already exists'
        });
      }

      // --------------------------------------------------
      // 2B. User exists BUT credentials don't exist
      // --------------------------------------------------

      console.log(
        'User exists but credentials do not. Creating credentials...'
      );

      const hashedPassword = await bcrypt.hash(
        password,
        saltRounds
      );

      const credentialRequest = new sql.Request();

      credentialRequest.input(
        'user_id',
        sql.Int,
        user_id
      );

      credentialRequest.input(
        'email',
        sql.VarChar,
        email
      );

      credentialRequest.input(
        'username',
        sql.VarChar,
        username
      );

      credentialRequest.input(
        'hashedPassword',
        sql.VarChar,
        hashedPassword
      );

      credentialRequest.input(
        'is_admin',
        sql.Bit,
        is_admin ?? false
      );

      await credentialRequest.query(`
        INSERT INTO credentials
          (user_id, email, username, password, is_admin)
        VALUES
          (@user_id, @email, @username, @hashedPassword, @is_admin)
      `);

      return res.status(201).json({
        message: 'Credentials created successfully',
        user_id
      });
      // return res.status(400).json({ error: 'User already exists' });
    }

  // user doesnt exist, Insert into users table
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
    // request.input('is_admin', sql.Bit, is_admin)
    credentialRequest.input('is_admin', sql.Bit, false);

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
    // NOTE: No MX/deliverability check on login. The account already exists, so
    // email deliverability is irrelevant for authentication — and an outbound DNS
    // failure here would wrongly block valid logins with "Email is not deliverable".
    // The MX check is kept for signup only.
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

// POST /api/users/forgot-password  { email }
// Emails a time-limited reset link. ALWAYS responds with the same 200 JSON
// regardless of input / outcome — we must never reveal whether an email is
// actually registered (account-enumeration attack / timing attack).
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const GENERIC_RESPONSE = { message: 'If that email is registered, a reset link has been sent.' };
  try {
    if (isValidEmailSyntax(email) !== true) {
      return res.status(200).json(GENERIC_RESPONSE);
    }

    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const userRes = await request.query(`
      SELECT TOP 1 u.user_id, u.email
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.email = @email
    `);

    if (userRes.recordset.length > 0) {
      const user = userRes.recordset[0];
      const token = jwt.sign(
        { id: user.user_id, purpose: 'pwreset' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );
      // Password reset link always points at the canonical storefront domain
      // (CLIENT_URL env var, defaulting to elmaghrib.com).  We MUST NOT use
      // req.headers.origin here — origin reflects whoever CALLED the API
      // (admin.elmaghrib.com, localhost:5173 dev server, 3rd-party tooling)
      // and the reset page only exists on the client storefront.  Using
      // origin was causing deployed users to receive links like
      // "https://admin.elmaghrib.com/reset-password?token=…" which 404 on the
      // admin panel and made them think no email arrived.
      const resetBase =
        (process.env.CLIENT_URL && String(process.env.CLIENT_URL).trim()) ||
        'https://elmaghrib.com';
      const resetUrl = `${resetBase.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
      try {
        await sendPasswordResetEmail({ email: user.email, resetUrl });
      } catch (mailErr) {
        // NEVER surface a mailer error to the HTTP client — that would let an
        // attacker tell apart "email not registered" (200 silent success) vs
        // "email registered but SMTP cert expired" (500).  Same response 200.
        const msg = mailErr && mailErr.message ? String(mailErr.message) : String(mailErr);
        const isCertErr = /certificate/i.test(msg);
        console.error(`[forgot password] SMTP failure sending to ${user.email}:`,
          isCertErr
            ? `TLS certificate issue — "${msg}". Fix: renew TLS cert on ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} OR set env SMTP_TLS_STRICT=false as a temporary workaround.`
            : msg);
      }
    }

    // Same identical response whether: bad email / user missing / mail failed.
    return res.status(200).json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('[forgot password] unhandled error:', error);
    // Even on total crashes, don't leak — same 200 response.
    return res.status(200).json(GENERIC_RESPONSE);
  }
};

// POST /api/users/reset-password  { token, password }
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token) return res.status(400).json({ error: 'Reset token is required' });
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }
    if (payload.purpose !== 'pwreset' || !payload.id) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    const lookupReq = new sql.Request();
    lookupReq.input('id', sql.Int, payload.id);
    const accountRes = await lookupReq.query(`
      SELECT TOP 1 u.user_id, u.is_registered, c.password_changed_at
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.user_id = @id
    `);
    if (accountRes.recordset.length === 0) {
      return res.status(400).json({ error: 'Account not found for this reset link.' });
    }
    const account = accountRes.recordset[0];

    // Single-use: any token issued before the last password change is dead.
    if (account.password_changed_at && payload.iat * 1000 < new Date(account.password_changed_at).getTime()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    const hash = await bcrypt.hash(String(password), saltRounds);
    const updateReq = new sql.Request();
    updateReq.input('id', sql.Int, payload.id);
    updateReq.input('password', sql.VarChar, hash);
    // If this was a guest user (is_registered = 0 from checkout auto-create) who
    // now set a real password via reset link → promote them to a fully registered
    // user so the is_registered filter on other endpoints (customer list, etc.)
    // includes them going forward.
    await updateReq.query(`
      UPDATE credentials SET password = @password, password_changed_at = GETDATE() WHERE user_id = @id;
      UPDATE users SET is_registered = 1, updated_at = GETDATE() WHERE user_id = @id AND ISNULL(is_registered, 0) = 0
    `);

    return res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, req.user.id);
    const result = await request.query(`
      SELECT TOP 1 u.user_id, u.email, c.username, c.is_admin
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.user_id = @id
    `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};