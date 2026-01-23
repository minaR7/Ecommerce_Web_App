const sql = require('mssql');

exports.getAll = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT 
        id,
        country,
        country_code AS countryCode,
        fee,
        currency,
        estimated_days AS estimatedDays,
        status,
        created_at,
        updated_at
      FROM shipping_rates
      ORDER BY country
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const result = await sql.query`
      SELECT TOP 1 
        id,
        country,
        country_code AS countryCode,
        fee,
        currency,
        estimated_days AS estimatedDays,
        status
      FROM shipping_rates
      WHERE LOWER(country) = LOWER(${country}) AND status = 'active'
    `;
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No shipping rate found for country' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { country, countryCode, fee, currency, estimatedDays, status } = req.body;
    if (!countryCode || fee == null) {
      return res.status(400).json({ message: 'countryCode and fee are required' });
    }
    const exists = await sql.query`SELECT id FROM shipping_rates WHERE LOWER(country) = LOWER(${country})`;
    if (exists.recordset.length > 0) {
      return res.status(409).json({ message: 'Rate for this country already exists' });
    }
    await sql.query`
      INSERT INTO shipping_rates (country, country_code, fee, currency, estimated_days, status, created_at)
      VALUES (${country}, ${countryCode}, ${fee}, ${currency || 'EUR'}, ${estimatedDays || null}, ${status || 'active'}, GETDATE())
    `;
    const result = await sql.query`
      SELECT TOP 1 
        id, country, country_code AS countryCode, fee, currency, estimated_days AS estimatedDays, status
      FROM shipping_rates WHERE LOWER(country) = LOWER(${country})
    `;
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { country, countryCode, fee, currency, estimatedDays, status } = req.body;
    const exists = await sql.query`SELECT id FROM shipping_rates WHERE id = ${id}`;
    if (exists.recordset.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    await sql.query`
      UPDATE shipping_rates
      SET country = ${country}, country_code = ${countryCode}, fee = ${fee}, currency = ${currency},
          estimated_days = ${estimatedDays}, status = ${status}, updated_at = GETDATE()
      WHERE id = ${id}
    `;
    const result = await sql.query`SELECT id, country, country_code AS countryCode, fee, currency, estimated_days AS estimatedDays, status FROM shipping_rates WHERE id = ${id}`;
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await sql.query`DELETE FROM shipping_rates WHERE id = ${id}`;
    if (del.rowsAffected[0] === 0) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFee = async (country) => {
  try {
    const result = await sql.query`
      SELECT TOP 1 fee
      FROM shipping_rates
      WHERE LOWER(country) = LOWER(${country}) AND status = 'active'
    `;
    if (result.recordset.length === 0) return null;
    return Number(result.recordset[0].fee);
  } catch (err) {
    console.error('getFee error', err);
    return null;
  }
};
