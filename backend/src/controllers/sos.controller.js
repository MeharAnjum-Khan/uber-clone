const sosService = require('../services/sos.service');

const triggerSOS = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;
    const { rideId, lat, lng } = req.body;

    if (!rideId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'rideId, lat, and lng are required' });
    }

    const alert = await sosService.triggerSOS(userId, rideId, lat, lng);
    res.status(201).json(alert);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message.includes('not a participant')) return res.status(403).json({ error: error.message });
    if (error.message.includes('active ride')) return res.status(400).json({ error: error.message });
    
    console.error('Trigger SOS Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRideAlerts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const { rideId } = req.params;
    const userId = req.user.id;

    const alerts = await sosService.getRideAlerts(rideId, userId);
    res.json(alerts);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized') return res.status(403).json({ error: 'Unauthorized' });

    console.error('Get SOS Alerts Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resolveAlert = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await sosService.resolveAlert(id, userId);
    res.json(alert);
  } catch (error) {
    if (error.message === 'Alert not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized' || error.message.includes('resolve this alert')) {
        return res.status(403).json({ error: 'Unauthorized: Only participants can resolve alerts' });
    }

    console.error('Resolve SOS Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  triggerSOS,
  getRideAlerts,
  resolveAlert,
};
