const sql = require('mssql');

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapCoupon = (row) => ({
  ...row,
  validFrom: formatDate(row.validFrom),
  validUntil: formatDate(row.validUntil),
});

const SAFE_SQL_MESSAGE = (err, fallback) => {
  console.error('[couponController]', err);
  if (process.env.NODE_ENV === 'development') return err.message || fallback;
  return fallback;
};

const SELECT_FIELDS = `
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
`;

exports.getCoupons = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT ${SELECT_FIELDS}
      FROM coupons
      ORDER BY created_at DESC
    `);
    const mapped = result.recordset.map(mapCoupon);
    res.status(200).json(mapped);
  } catch (err) {
    res.status(500).json({ message: SAFE_SQL_MESSAGE(err, 'Server error') });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = new sql.Request();
    request.input('id', sql.Int, Number(id));
    const result = await request.query(`
      SELECT ${SELECT_FIELDS} FROM coupons WHERE coupon_id = @id
    `);
    if (result.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(mapCoupon(result.recordset[0]));
  } catch (err) {
    res.status(500).json({ message: SAFE_SQL_MESSAGE(err, 'Server error') });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, validFrom, validUntil, status, usageLimit, usedCount } = req.body;
    if (!code || !discountType || discountValue == null || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Duplicate check
    const dupReq = new sql.Request();
    dupReq.input('code', sql.VarChar(50), String(code).trim());
    const exists = await dupReq.query(`SELECT coupon_id FROM coupons WHERE code = @code`);
    if (exists.recordset.length > 0) {
      return res.status(409).json({ message: 'A coupon with this code already exists.' });
    }

    const insertReq = new sql.Request();
    insertReq.input('code', sql.VarChar(50), String(code).trim());
    insertReq.input('discountType', sql.VarChar(20), String(discountType));
    insertReq.input('discountValue', sql.Decimal(18, 2), Number(discountValue));
    insertReq.input('validFrom', sql.Date, new Date(validFrom));
    insertReq.input('validUntil', sql.Date, new Date(validUntil));
    insertReq.input('status', sql.VarChar(20), status && String(status).length ? String(status) : 'active');
    if (usageLimit == null || usageLimit === '') {
      insertReq.input('usageLimit', sql.Int, null);
    } else {
      insertReq.input('usageLimit', sql.Int, Number(usageLimit));
    }
    insertReq.input('usedCount', sql.Int, usedCount == null ? 0 : Number(usedCount));

    await insertReq.query(`
      INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, status, usage_limit, used_count, created_at)
      VALUES (@code, @discountType, @discountValue, @validFrom, @validUntil, @status, @usageLimit, @usedCount, GETDATE())
    `);

    const fetchReq = new sql.Request();
    fetchReq.input('code', sql.VarChar(50), String(code).trim());
    const created = await fetchReq.query(`
      SELECT ${SELECT_FIELDS} FROM coupons WHERE code = @code ORDER BY coupon_id DESC
    `);

    res.status(201).json(mapCoupon(created.recordset[0]));
  } catch (err) {
    res.status(500).json({ message: SAFE_SQL_MESSAGE(err, 'Failed to create coupon — please try again') });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, validFrom, validUntil, status, usageLimit, usedCount } = req.body;

    const existsReq = new sql.Request();
    existsReq.input('id', sql.Int, Number(id));
    const exists = await existsReq.query(`SELECT coupon_id FROM coupons WHERE coupon_id = @id`);
    if (exists.recordset.length === 0) return res.status(404).json({ message: 'Coupon not found' });

    const updateReq = new sql.Request();
    updateReq.input('id', sql.Int, Number(id));
    updateReq.input('code', sql.VarChar(50), String(code).trim());
    updateReq.input('discountType', sql.VarChar(20), String(discountType));
    updateReq.input('discountValue', sql.Decimal(18, 2), Number(discountValue));
    updateReq.input('validFrom', sql.Date, new Date(validFrom));
    updateReq.input('validUntil', sql.Date, new Date(validUntil));
    updateReq.input('status', sql.VarChar(20), status && String(status).length ? String(status) : 'active');
    if (usageLimit == null || usageLimit === '') {
      updateReq.input('usageLimit', sql.Int, null);
    } else {
      updateReq.input('usageLimit', sql.Int, Number(usageLimit));
    }
    updateReq.input('usedCount', sql.Int, usedCount == null ? 0 : Number(usedCount));

    await updateReq.query(`
      UPDATE coupons
      SET code = @code,
          discount_type = @discountType,
          discount_value = @discountValue,
          valid_from = @validFrom,
          valid_until = @validUntil,
          status = @status,
          usage_limit = @usageLimit,
          used_count = @usedCount,
          updated_at = GETDATE()
      WHERE coupon_id = @id
    `);

    const fetchReq = new sql.Request();
    fetchReq.input('id', sql.Int, Number(id));
    const updated = await fetchReq.query(`
      SELECT ${SELECT_FIELDS} FROM coupons WHERE coupon_id = @id
    `);

    res.status(200).json(mapCoupon(updated.recordset[0]));
  } catch (err) {
    res.status(500).json({ message: SAFE_SQL_MESSAGE(err, 'Failed to update coupon — please try again') });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteReq = new sql.Request();
    deleteReq.input('id', sql.Int, Number(id));
    const result = await deleteReq.query(`DELETE FROM coupons WHERE coupon_id = @id`);
    if ((result.rowsAffected[0] || 0) === 0) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: SAFE_SQL_MESSAGE(err, 'Failed to delete coupon') });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const rawCode = req.params.code || req.body.code;
    if (!rawCode) return res.status(400).json({ valid: false, message: 'Coupon code required' });
    const code = String(rawCode).trim();

    const req1 = new sql.Request();
    req1.input('code', sql.VarChar(50), code);
    const result = await req1.query(`
      SELECT TOP 1 code, discount_type, discount_value, valid_from, valid_until, status, usage_limit, used_count
      FROM coupons WHERE LTRIM(RTRIM(LOWER(code))) = LOWER(@code)
    `);
    if (result.recordset.length === 0) return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    const c = result.recordset[0];
    const now = new Date();
    const fromOk = new Date(c.valid_from) <= now;
    const untilOk = now <= new Date(c.valid_until);
    const statusOk = String(c.status).toLowerCase() === 'active';
    const usageOk = c.usage_limit == null || Number(c.used_count) < Number(c.usage_limit);
    if (!fromOk || !untilOk || !statusOk || !usageOk) {
      return res.status(400).json({
        valid: false,
        message: !fromOk || !untilOk ? 'Coupon is expired' :
                 !statusOk ? 'Coupon is inactive' :
                 'Coupon usage limit has been reached'
      });
    }
    res.status(200).json({
      valid: true,
      type: c.discount_type,
      value: Number(c.discount_value),
      discountPercentage: c.discount_type === 'percentage' ? Number(c.discount_value) : 0
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: SAFE_SQL_MESSAGE(err, 'Internal server error') });
  }
};
