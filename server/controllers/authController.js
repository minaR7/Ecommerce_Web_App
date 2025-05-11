const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // assuming mssql is configured properly

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user from database
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);

    const result = await request.query('SELECT * FROM users WHERE email = @email');
    const user = result.recordset[0];

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Remove password before sending user info
    delete user.password;

    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
