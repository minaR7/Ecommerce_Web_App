const jwt = require('jsonwebtoken');
const sql = require('mssql');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the token exists and starts with "Bearer"
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Logout-everywhere check: if the token was issued BEFORE the most recent
      // password change, it is no longer valid — user must log in again with
      // the new password from this device.
      try {
        const userId = decoded.id ?? decoded.user_id;
        if (userId != null) {
          const request = new sql.Request();
          request.input('userId', sql.Int, userId);
          const checkRes = await request.query(`
            SELECT TOP 1 password_changed_at, is_admin
            FROM credentials
            WHERE user_id = @userId
          `);
          const row = checkRes.recordset[0];
          if (row && row.password_changed_at && decoded.iat) {
            const tokenIssuedAtMs = decoded.iat * 1000;
            const changedAtMs = new Date(row.password_changed_at).getTime();
            if (tokenIssuedAtMs < changedAtMs) {
              return res.status(401).json({ message: 'Session revoked — password has been changed. Please log in again.' });
            }
          }
          // Normalize decoded.user_id so downstream code reads either id or user_id consistently
          if (row) decoded.is_admin = decoded.is_admin ?? row.is_admin;
        }
      } catch (checkErr) {
        // Non-fatal: if DB is down mid-check we should not break existing sessions.
        console.warn('verifyToken: password-changed check skipped:', checkErr.message);
      }

      req.user = decoded; // store user ID in req.user for use in controller
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = verifyToken;
