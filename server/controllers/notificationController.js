const sql = require('mssql');

exports.getUnread = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT notification_id, type, title, message, metadata_json, is_read, created_at
      FROM notifications
      WHERE is_read = 0
      ORDER BY created_at DESC, notification_id DESC
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// GET /api/notifications?status=all|unread|read&type=<type>&page=1&pageSize=20
exports.list = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
    const status = ['unread', 'read'].includes(req.query.status) ? req.query.status : 'all';
    const type = req.query.type ? String(req.query.type).slice(0, 50) : null;

    const where = ['1 = 1'];
    if (status === 'unread') where.push('is_read = 0');
    if (status === 'read') where.push('is_read = 1');
    if (type) where.push('type = @type');

    const request = new sql.Request();
    request.input('offset', sql.Int, (page - 1) * pageSize);
    request.input('pageSize', sql.Int, pageSize);
    if (type) request.input('type', sql.NVarChar(50), type);
    const result = await request.query(`
      SELECT COUNT(*) AS total FROM notifications WHERE ${where.join(' AND ')};
      SELECT SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread FROM notifications;
      SELECT notification_id, type, title, message, metadata_json, is_read, created_at
      FROM notifications
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC, notification_id DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `);
    res.status(200).json({
      items: result.recordsets[2],
      total: result.recordsets[0][0].total,
      unread: result.recordsets[1][0].unread || 0,
      page,
      pageSize,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid notification id' });
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    const result = await request.query(`DELETE FROM notifications WHERE notification_id = @id`);
    if (!result.rowsAffected[0]) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return res.status(400).json({ error: 'Invalid notification id' });
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
