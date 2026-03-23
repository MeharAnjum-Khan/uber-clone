const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Service: Sync Clerk User
 * Adds a user to the database if they don't exist.
 */
const syncUser = async (user) => {
  const { id, email, name, phone } = user;

  // Check if user already exists
  const existingUserQuery = 'SELECT id FROM users WHERE id = $1';
  const { rows: existingRows } = await pool.query(existingUserQuery, [id]);

  if (existingRows.length > 0) {
    return existingRows[0]; // Return existing user, do nothing
  }

  // Insert new user
  const insertQuery = `
    INSERT INTO users (id, email, name, phone, role, created_at)
    VALUES ($1, $2, $3, $4, 'rider', NOW())
    RETURNING *;
  `;
  const insertValues = [id, email, name, phone];

  const { rows: newRows } = await pool.query(insertQuery, insertValues);

  return newRows[0];
};

/**
 * Service: Get User Profile
 */
const getUserProfile = async (userId) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await pool.query(query, [userId]);

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  return rows[0];
};

/**
 * Service: Update User Profile
 * Only allows updating name and phone.
 */
const updateUserProfile = async (userId, updates) => {
  const { name, phone } = updates;
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    setClauses.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }
  if (phone !== undefined) {
    setClauses.push(`phone = $${paramIndex}`);
    values.push(phone);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);
  const query = `
    UPDATE users
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  return rows[0];
};

/**
 * Service: Get User By ID
 */
const getUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0) {
    throw new Error('User not found');
  }

  return rows[0];
};

const getEmergencyContacts = async (userId) => {
  const query = 'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at ASC';
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const addEmergencyContact = async (userId, contact) => {
  const { name, phone, relation } = contact;
  const query = `
    INSERT INTO emergency_contacts (user_id, name, phone, relation, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
  `;
  const values = [userId, name, phone, relation];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteEmergencyContact = async (userId, contactId) => {
  const query = 'DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING *';
  const { rowCount } = await pool.query(query, [contactId, userId]);
  if (rowCount === 0) {
    throw new Error('Contact not found');
  }
  return true;
};

module.exports = {
  syncUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact
};
