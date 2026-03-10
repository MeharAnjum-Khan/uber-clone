const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Service: Create Promo Code
 */
const createPromoCode = async (promoData) => {
  const { code, discount, type, expires_at } = promoData;

  const query = `
    INSERT INTO promo_codes (code, discount, type, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [code.toUpperCase(), discount, type, expires_at];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Promo code already exists');
    }
    throw error;
  }
};

/**
 * Service: Get Promo Code Details
 */
const getPromoCode = async (code) => {
  const query = 'SELECT * FROM promo_codes WHERE code = $1';
  const { rows } = await pool.query(query, [code.toUpperCase()]);

  if (rows.length === 0) {
    throw new Error('Promo code not found');
  }

  return rows[0];
};

/**
 * Service: Validate Promo Code
 */
const validatePromoCode = async (code) => {
  const query = 'SELECT * FROM promo_codes WHERE code = $1';
  const { rows } = await pool.query(query, [code.toUpperCase()]);

  if (rows.length === 0) {
    throw new Error('Invalid promo code');
  }

  const promo = rows[0];

  // Check Expiration
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    throw new Error('Promo code has expired');
  }

  return {
    valid: true,
    code: promo.code,
    type: promo.type,
    discount: promo.discount
  };
};

/**
 * Service: Delete Promo Code
 */
const deletePromoCode = async (code) => {
  const query = 'DELETE FROM promo_codes WHERE code = $1 RETURNING *';
  const { rows } = await pool.query(query, [code.toUpperCase()]);

  if (rows.length === 0) {
    throw new Error('Promo code not found');
  }

  return { message: 'Promo code deleted successfully' };
};

module.exports = {
  createPromoCode,
  getPromoCode,
  validatePromoCode,
  deletePromoCode,
};
