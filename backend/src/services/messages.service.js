const { Pool } = require('pg');

// Initialize Pool
const pool = new Pool();

/**
 * Service: Send Message
 * Validates participants and ride status then inserts message.
 */
const sendMessage = async (senderId, rideId, text) => {
  // 1. Fetch Ride details to validate participants and status
  const rideQuery = 'SELECT rider_id, driver_id, status FROM rides WHERE id = $1';
  const { rows: rides } = await pool.query(rideQuery, [rideId]);

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }

  const ride = rides[0];

  // 2. Validate Membership and Determine Receiver
  let receiverId = null;
  if (ride.rider_id === senderId) {
    receiverId = ride.driver_id;
  } else if (ride.driver_id === senderId) {
    receiverId = ride.rider_id;
  } else {
    throw new Error('User is not a participant in this ride');
  }

  if (!receiverId) {
    throw new Error('No receiver available for this ride (driver not yet assigned)');
  }

  // 3. Validate Ride Status (Allow chat for accepted, arriving, or started)
  const activeStatuses = ['accepted', 'arriving', 'started'];
  if (!activeStatuses.includes(ride.status)) {
    throw new Error('Chat is only available for active rides');
  }

  // 4. Insert Message
  const insertQuery = `
    INSERT INTO messages (ride_id, sender_id, receiver_id, text, sent_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
  `;
  const values = [rideId, senderId, receiverId, text];
  
  const { rows: messages } = await pool.query(insertQuery, values);
  return messages[0];
};

/**
 * Service: Get Ride Chat History
 */
const getRideMessages = async (rideId, requesterId) => {
  // 1. Fetch Ride to check permissions
  const rideQuery = 'SELECT rider_id, driver_id FROM rides WHERE id = $1';
  const { rows: rides } = await pool.query(rideQuery, [rideId]);

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }

  const ride = rides[0];
  if (ride.rider_id !== requesterId && ride.driver_id !== requesterId) {
    throw new Error('Unauthorized to view chat history for this ride');
  }

  // 2. Fetch Messages
  const query = `
    SELECT * FROM messages 
    WHERE ride_id = $1 
    ORDER BY sent_at ASC;
  `;
  const { rows } = await pool.query(query, [rideId]);
  return rows;
};

module.exports = {
  sendMessage,
  getRideMessages,
};
