const messagesService = require('../services/messages.service');

const send = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const senderId = req.user.id;
    const { rideId, text } = req.body;

    if (!rideId || !text) {
      return res.status(400).json({ error: 'rideId and text are required' });
    }

    const message = await messagesService.sendMessage(senderId, rideId, text);
    res.status(201).json(message);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message.includes('not a participant')) return res.status(403).json({ error: error.message });
    if (error.message.includes('Chat is only available') || error.message.includes('No receiver available')) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Send Message Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const { rideId } = req.params;
    const userId = req.user.id;

    const messages = await messagesService.getRideMessages(rideId, userId);
    res.json(messages);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });

    console.error('Get Chat History Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  send,
  getHistory,
};
