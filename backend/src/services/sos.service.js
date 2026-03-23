const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Service: Trigger SOS
 */
const triggerSOS = async (userId, rideId, lat, lng) => {
  // 1. Fetch Ride details
  const rideQuery = 'SELECT * FROM rides WHERE id = $1';
  const { rows: rides } = await pool.query(rideQuery, [rideId]);

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }
  const ride = rides[0];

  // 2. Validate Membership
  if (ride.rider_id !== userId && ride.driver_id !== userId) {
    throw new Error('User is not a participant in this ride');
  }

  // 3. Validate Ride Status (Must be active)
  if (!['started', 'arriving', 'in_progress', 'accepted'].includes(ride.status)) {
    throw new Error('SOS can only be triggered during an active ride');
  }

  // 4. Insert Alert
  const insertQuery = `
    INSERT INTO sos_alerts (ride_id, lat, lng, status, triggered_at)
    VALUES ($1, $2, $3, 'notified', NOW())
    RETURNING *;
  `;
  const values = [rideId, lat, lng];
  
  const { rows: alerts } = await pool.query(insertQuery, values);
  const alert = alerts[0];

  // 5. Fetch Emergency Contacts and Mock SMS
  const contactsQuery = 'SELECT * FROM emergency_contacts WHERE user_id = $1';
  const { rows: contacts } = await pool.query(contactsQuery, [userId]);
  
  if (contacts.length > 0) {
    console.log(`\n🚨 --- [MOCK SMS SYSTEM] SOS TRIGGERED FOR RIDE ${rideId} --- 🚨`);
    contacts.forEach(contact => {
      console.log(`[SMS To ${contact.phone}] EMERGENCY: The user has pressed the SOS button during their ride.`);
      console.log(`[SMS To ${contact.phone}] Last Known Location: Lat ${lat}, Lng ${lng}\n`);
    });
  } else {
    console.log(`\n🚨 --- [MOCK SMS SYSTEM] SOS TRIGGERED FOR RIDE ${rideId} --- 🚨`);
    console.log(`No emergency contacts found for user ${userId}\n`);
  }

  // Attach notified contacts count to the response
  return {
    ...alert,
    notified_contacts_count: contacts.length
  };
};

/**
 * Service: Get SOS Alerts for a Ride
 */
const getRideAlerts = async (rideId, requesterId) => {
  // 1. Fetch Ride to check permissions
  // (Could be done with a JOIN, but explicit check is clearer)
  const rideQuery = 'SELECT rider_id, driver_id FROM rides WHERE id = $1';
  const { rows: rides } = await pool.query(rideQuery, [rideId]);

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }
  const ride = rides[0];

  if (ride.rider_id !== requesterId && ride.driver_id !== requesterId) {
    // Admin check logic could go here if user role available
    throw new Error('Unauthorized');
  }

  const query = 'SELECT * FROM sos_alerts WHERE ride_id = $1 ORDER BY triggered_at DESC';
  const { rows } = await pool.query(query, [rideId]);
  return rows;
};

/**
 * Service: Resolve SOS Alert
 */
const resolveAlert = async (alertId, userId) => {
  // 1. Fetch Alert & Ride to check permissions
  // We need to join with rides table to confirm the user is a participant of the ride this alert belongs to
  const query = `
    SELECT s.*, r.rider_id, r.driver_id 
    FROM sos_alerts s
    JOIN rides r ON s.ride_id = r.id
    WHERE s.id = $1
  `;
  const { rows } = await pool.query(query, [alertId]);

  if (rows.length === 0) {
    throw new Error('Alert not found');
  }
  const alertRow = rows[0];

  // 2. Permission Check
  // Allow ride participants to resolve it.
  if (alertRow.rider_id !== userId && alertRow.driver_id !== userId) {
    throw new Error('Unauthorized to resolve this alert');
  }

  // 3. Update Status
  const updateQuery = `
    UPDATE sos_alerts 
    SET status = 'resolved' 
    WHERE id = $1 
    RETURNING *;
  `;
  const { rows: updated } = await pool.query(updateQuery, [alertId]);
  return updated[0];
};

module.exports = {
  triggerSOS,
  getRideAlerts,
  resolveAlert,
};
