const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Service: Register Driver
 * Creates a new driver profile for an existing user.
 */
const registerDriver = async (userId, vehicleDetails) => {
  const query = `
    INSERT INTO drivers (user_id, status, vehicle_details, last_heartbeat)
    VALUES ($1, 'offline', $2, NOW())
    RETURNING *;
  `;
  const values = [userId, vehicleDetails];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
        throw new Error('Driver profile already exists');
    }
    // Foreign key violation means user doesn't exist
    if (error.code === '23503') {
        throw new Error('User not found');
    }
    throw error;
  }
};

/**
 * Service: Get Driver Profile
 */
const getDriverProfile = async (userId) => {
  const query = `
    SELECT * FROM drivers
    WHERE user_id = $1;
  `;
  const values = [userId];

  const { rows } = await pool.query(query, values);
  
  if (rows.length === 0) {
    return null; // Controller handles 404
  }
  
  return rows[0];
};

/**
 * Service: Update Driver Status
 */
const updateDriverStatus = async (userId, status) => {
  const query = `
    UPDATE drivers
    SET status = $1
    WHERE user_id = $2
    RETURNING *;
  `;
  const values = [status, userId];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error('Driver not found');
  }

  return rows[0];
};

/**
 * Service: Update Driver Location
 */
const updateDriverLocation = async (userId, lat, lng) => {
  const query = `
    UPDATE drivers
    SET last_lat = $1, last_lng = $2, last_heartbeat = NOW()
    WHERE user_id = $3
    RETURNING *;
  `;
  const values = [lat, lng, userId];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error('Driver not found');
  }

  return rows[0];
};

/**
 * Service: Get Nearby Drivers
 * Simple bounding box query on lat/lng
 */
const getNearbyDrivers = async (lat, lng) => {
  const range = 0.05; // Approx 5km box
  const minLat = lat - range;
  const maxLat = lat + range;
  const minLng = lng - range;
  const maxLng = lng + range;

  const query = `
    SELECT * FROM drivers
    WHERE status = 'online'
    AND last_lat BETWEEN $1 AND $2
    AND last_lng BETWEEN $3 AND $4;
  `;
  const values = [minLat, maxLat, minLng, maxLng];

  const { rows } = await pool.query(query, values);
  return rows;
};

module.exports = {
  registerDriver,
  getDriverProfile,
  updateDriverStatus,
  updateDriverLocation,
  getNearbyDrivers,
};
