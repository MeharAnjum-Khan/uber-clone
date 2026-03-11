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
    const query = 'SELECT id, email, role FROM users WHERE clerk_id = $1';
    const { rows } = await pool.query(query, [clerkId]);

    if (rows.length === 0) {
      // User is authenticated by Clerk but not yet synced in our DB
      // We can either return 401 or attach basic info to force a sync
      req.user = { clerk_id: clerkId, needsSync: true };
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
