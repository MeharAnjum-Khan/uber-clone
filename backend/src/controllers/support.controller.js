const supportService = require('../services/support.service');

const createTicket = async (req, res) => {
  try {
    const { rideId, category, subject, message } = req.body;
    
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;

    if (!category || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields (category, subject, message)' });
    }

    const ticket = await supportService.createTicket(userId, {
      rideId,
      category,
      subject,
      message,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const tickets = await supportService.getUserTickets(userId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const ticket = await supportService.getTicketById(id, userId);
    res.json(ticket);
  } catch (error) {
    if (error.message === 'Ticket not found') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketDetails,
};
