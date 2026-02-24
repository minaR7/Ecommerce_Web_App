const jwt = require('jsonwebtoken');
const sql = require('mssql');

const isAdminFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const request = new sql.Request();
    request.input('userId', sql.Int, decoded.id);
    const res = await request.query(`
      SELECT c.is_admin
      FROM credentials c
      WHERE c.user_id = @userId
    `);
    if (res.recordset.length === 0) return false;
    return !!res.recordset[0].is_admin;
  } catch {
    return false;
  }
};

const registerNotificationSocket = (io) => {
  io.on('connection', async (socket) => {
    const auth = socket.handshake.auth || {};
    let isAdmin = false;
    if (auth.token) {
      isAdmin = await isAdminFromToken(auth.token);
    } else if (auth.isAdmin === true || auth.role === 'admin') {
      isAdmin = true;
    }
    if (isAdmin) socket.join('admins');
    socket.on('join-admin', async (data) => {
      let ok = false;
      if (data?.token) ok = await isAdminFromToken(data.token);
      else if (data?.isAdmin === true || data?.role === 'admin') ok = true;
      if (ok) socket.join('admins');
    });
  });
};

module.exports = { registerNotificationSocket };
