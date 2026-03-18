const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Custom Middleware to enhance Clerk Auth with DB data
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Clerk handles the actual JWT verification
    // This will attach 'auth' to req
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Unauthorized: No valid session' });
    }

    const clerkId = req.auth.userId;

    // 2. Fetch our internal DB user based on Clerk ID
    // In our schema, the Clerk user ID is stored directly in the primary key column `id`.
    const query = 'SELECT id, email, role FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [clerkId]);

    if (rows.length === 0) {
      // User is authenticated by Clerk but not yet present in our DB.
      // Attach a minimal user object so downstream handlers can still use the Clerk ID,
      // and mark that a sync is needed.
      req.user = { id: clerkId, email: null, role: 'rider', needsSync: true };
    } else {
      // Attach full internal user object to request
      req.user = rows[0];
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Internal Server Error during Authentication' });
  }
};

/**
 * Clerk Identity Middleware (Verifies the Token)
 */
const verifyToken = ClerkExpressRequireAuth({
  onError: (err) => {
    console.error('Clerk Auth Error:', err);
  }
});

module.exports = {
  verifyToken,
  authMiddleware,
};
