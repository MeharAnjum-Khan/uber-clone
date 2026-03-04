const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'rider' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /users/sync
router.post('/sync', authMiddleware, usersController.syncUser);

// GET /users/me
router.get('/me', authMiddleware, usersController.getMe);

// PATCH /users/me
router.patch('/me', authMiddleware, usersController.updateMe);

// GET /users/:id
router.get('/:id', authMiddleware, usersController.getUserById);

module.exports = router;
