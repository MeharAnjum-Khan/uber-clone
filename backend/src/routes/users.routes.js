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

// GET /users/me/emergency-contacts
router.get('/me/emergency-contacts', verifyToken, authMiddleware, usersController.getEmergencyContacts);

// POST /users/me/emergency-contacts
router.post('/me/emergency-contacts', verifyToken, authMiddleware, usersController.addEmergencyContact);

// DELETE /users/me/emergency-contacts/:contactId
router.delete('/me/emergency-contacts/:contactId', verifyToken, authMiddleware, usersController.deleteEmergencyContact);

// GET /users/:id
router.get('/:id', verifyToken, authMiddleware, usersController.getUserById);

module.exports = router;
