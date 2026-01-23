const sql = require('mssql');

exports.getCoupons = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        coupon_id AS id,
        code,
        discount_type AS discountType,
        discount_value AS discountValue,
        valid_from AS validFrom,
        valid_until AS validUntil,
        status,
        usage_limit AS usageLimit,
        used_count AS usedCount,
        created_at,
        updated_at
      FROM coupons
      ORDER BY created_at DESC
    `);
    console.error(result);
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query`
      SELECT 
        coupon_id AS id,
        code,
        discount_type AS discountType,
        discount_value AS discountValue,
        valid_from AS validFrom,
        valid_until AS validUntil,
        status,
        usage_limit AS usageLimit,
        used_count AS usedCount,
        created_at,
        updated_at
      FROM coupons WHERE coupon_id = ${id}
    `;
    if (result.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, validFrom, validUntil, status, usageLimit, usedCount } = req.body;
    if (!code || !discountType || discountValue == null || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const exists = await sql.query`SELECT coupon_id FROM coupons WHERE code = ${code}`;
    if (exists.recordset.length > 0) return res.status(409).json({ message: 'Code already exists' });
    const result = await sql.query`
      INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, status, usage_limit, used_count, created_at)
      VALUES (${code}, ${discountType}, ${discountValue}, ${validFrom}, ${validUntil}, ${status || 'active'}, ${usageLimit || null}, ${usedCount || 0}, GETDATE());
      SELECT 
        coupon_id AS id,
        code,
        discount_type AS discountType,
        discount_value AS discountValue,
        valid_from AS validFrom,
        valid_until AS validUntil,
        status,
        usage_limit AS usageLimit,
        used_count AS usedCount,
        created_at,
        updated_at
      FROM coupons WHERE code = ${code}
    `;
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, validFrom, validUntil, status, usageLimit, usedCount } = req.body;
    const exists = await sql.query`SELECT coupon_id FROM coupons WHERE coupon_id = ${id}`;
    if (exists.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
    await sql.query`
      UPDATE coupons
      SET code = ${code}, discount_type = ${discountType}, discount_value = ${discountValue},
          valid_from = ${validFrom}, valid_until = ${validUntil}, status = ${status},
          usage_limit = ${usageLimit || null}, used_count = ${usedCount || 0}, updated_at = GETDATE()
      WHERE coupon_id = ${id}
    `;
    const result = await sql.query`
      SELECT 
        coupon_id AS id,
        code,
        discount_type AS discountType,
        discount_value AS discountValue,
        valid_from AS validFrom,
        valid_until AS validUntil,
        status,
        usage_limit AS usageLimit,
        used_count AS usedCount,
        created_at,
        updated_at
      FROM coupons WHERE coupon_id = ${id}
    `;
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query`DELETE FROM coupons WHERE coupon_id = ${id}`;
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const code = req.params.code || req.body.code;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code required' });
    const result = await sql.query`
      SELECT TOP 1 code, discount_type, discount_value, valid_from, valid_until, status, usage_limit, used_count
      FROM coupons WHERE LOWER(code) = LOWER(${code})
    `;
    if (result.recordset.length === 0) return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    const c = result.recordset[0];
    const now = new Date();
    const fromOk = new Date(c.valid_from) <= now;
    const untilOk = now <= new Date(c.valid_until);
    const statusOk = c.status === 'active';
    const usageOk = c.usage_limit == null || c.used_count < c.usage_limit;
    if (!fromOk || !untilOk || !statusOk || !usageOk) return res.status(400).json({ valid: false, message: 'Coupon not applicable' });
    res.status(200).json({
      valid: true,
      type: c.discount_type,
      value: Number(c.discount_value),
      discountPercentage: c.discount_type === 'percentage' ? Number(c.discount_value) : 0
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};
