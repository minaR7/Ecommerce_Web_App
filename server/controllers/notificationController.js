const sql = require('mssql');

exports.getUnread = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT notification_id, type, title, message, metadata_json, is_read, created_at
      FROM notifications
      WHERE is_read = 0
      ORDER BY created_at DESC
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, Number(id));
    const result = await request.query(`
      UPDATE notifications
      SET is_read = 1
      WHERE notification_id = @id
    `);
    res.status(200).json({ success: true, rowsAffected: result.rowsAffected[0] || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await sql.query(`
      UPDATE notifications
      SET is_read = 1
      WHERE is_read = 0
    `);
    res.status(200).json({ success: true, rowsAffected: result.rowsAffected[0] || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};
