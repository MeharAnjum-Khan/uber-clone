const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /users/sync (Requires original verification only, sync handles user creation)
router.post('/sync', verifyToken, usersController.syncUser);

// GET /users/me
router.get('/me', verifyToken, authMiddleware, usersController.getMe);

// PATCH /users/me
router.patch('/me', verifyToken, authMiddleware, usersController.updateMe);

// GET /users/:id
router.get('/:id', verifyToken, authMiddleware, usersController.getUserById);

module.exports = router;
