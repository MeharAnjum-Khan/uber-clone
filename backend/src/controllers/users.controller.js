const usersService = require('../services/users.service');

const syncUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const id = req.user.id;
    const { email, name, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await usersService.syncUser({
      id,
      email,
      name,
      phone,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;

    const user = await usersService.getUserProfile(userId);
    res.json(user);
  } catch (error) {
    if (error.message.includes('found')) { // Generic catch for now, refined based on service error
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;
    const { name, phone } = req.body;

    const result = await usersService.updateUserProfile(userId, { name, phone });
    res.json(result);
  } catch (error) {
    if (error.message === 'No valid fields to update') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  syncUser,
  getMe,
  updateMe,
  getUserById,
};
