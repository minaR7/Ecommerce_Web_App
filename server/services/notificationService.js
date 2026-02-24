const sql = require('mssql');
let ioRef = null;

const init = (io) => {
  ioRef = io;
};

const saveNotification = async ({ type, title, message, meta }) => {
  const request = new sql.Request();
  request.input('type', sql.NVarChar, type);
  request.input('title', sql.NVarChar, title);
  request.input('message', sql.NVarChar, message);
  request.input('meta', sql.NVarChar, meta ? JSON.stringify(meta) : null);
  const result = await request.query(`
    INSERT INTO notifications (type, title, message, metadata_json, is_read, created_at)
    OUTPUT INSERTED.notification_id, INSERTED.type, INSERTED.title, INSERTED.message, INSERTED.metadata_json, INSERTED.is_read, INSERTED.created_at
    VALUES (@type, @title, @message, @meta, 0, GETDATE())
  `);
  return result.recordset[0];
};

const notifyAdmins = async (payload) => {
  const saved = await saveNotification(payload);
  if (ioRef) ioRef.to('admins').emit('new-notification', saved);
  return saved;
};

module.exports = { init, notifyAdmins, saveNotification };
