const ridesService = require('../services/rides.service');

const requestRide = async (req, res) => {
  try {
    const { pickup, drop, rideType, promoCode } = req.body;
    
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const riderId = req.user.id; // From Auth Middleware

    if (!pickup || !drop || !rideType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Set app instance for socket emissions
    ridesService.setAppInstance(req.app);

    const result = await ridesService.requestRide(riderId, {
      pickup,
      drop,
      rideType,
      promoCode,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('RequestRide error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const getHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const userRole = req.user.role || 'rider';

    const history = await ridesService.getRideHistory(userId, userRole);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRide = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await ridesService.getRideById(id);
    res.json(ride);
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ error: 'Ride not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const userId = req.user.id;
    const userRole = req.user.role; // 'rider' or 'driver'

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Set app instance for socket emissions
    ridesService.setAppInstance(req.app);

    const result = await ridesService.updateRideStatus(id, userId, userRole, status);
    res.json(result);
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ error: 'Ride not found' });
    }
    if (error.message.includes('Unauthorized') || error.message.includes('can only cancel')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getEstimate = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = req.query;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return res.status(400).json({ error: 'pickupLat, pickupLng, dropLat and dropLng are required' });
    }

    const estimates = await ridesService.getFareEstimate(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(dropLat),
      parseFloat(dropLng)
    );

    res.json(estimates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEstimate,
  requestRide,
  getHistory,
  getRide,
  updateStatus,
};
