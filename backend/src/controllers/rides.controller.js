const ridesService = require('../services/rides.service');

const getEstimate = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = req.query;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return res.status(400).json({ error: 'Missing coordinates' });
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

    const result = await ridesService.requestRide(riderId, {
      pickup,
      drop,
      rideType,
      promoCode,
    });

    res.status(201).json(result);
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

module.exports = {
  getEstimate,
  requestRide,
  getRide,
  updateStatus,
};
