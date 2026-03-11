const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

/**
 * Service: Create a Support Ticket
 */
const createTicket = async (userId, { rideId, category, subject, message }) => {
  const query = `
    INSERT INTO support_tickets (user_id, ride_id, category, subject, description, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
  `;
  const values = [userId, rideId || null, category, subject, message, TICKET_STATUS.OPEN];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Service: Get User Tickets
 */
const getUserTickets = async (userId) => {
  const query = `
    SELECT * FROM support_tickets 
    WHERE user_id = $1 
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * Service: Get Ticket Details
 */
const getTicketById = async (ticketId, userId) => {
  const query = `
    SELECT * FROM support_tickets 
    WHERE id = $1 AND user_id = $2;
  `;
  const { rows } = await pool.query(query, [ticketId, userId]);
  
  if (rows.length === 0) {
    throw new Error('Ticket not found');
  }
  return rows[0];
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketById,
  TICKET_STATUS,
};
