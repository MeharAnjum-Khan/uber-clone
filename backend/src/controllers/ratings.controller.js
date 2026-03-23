const ratingsService = require('../services/ratings.service');

const submitRating = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    const raterId = req.user.id;
    const { rideId, rating, comment } = req.body;

    // Validation
    if (!rideId || !rating) {
      return res.status(400).json({ error: 'rideId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await ratingsService.submitRating(raterId, rideId, rating, comment);
    
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message.includes('not completed') || error.message.includes('already rated')) {
        return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('not a participant')) return res.status(403).json({ error: error.message });

    console.error('Submit Rating Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRideRatings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { rideId } = req.params;
    const requesterId = req.user.id;

    const ratings = await ratingsService.getRideRatings(rideId, requesterId);
    res.json(ratings);
  } catch (error) {
    if (error.message === 'Ride not found') return res.status(404).json({ error: error.message });
    if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });

    console.error('Get Ride Ratings Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserAverage = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Anyone can see anyone's average rating (public profile info)
    const result = await ratingsService.getUserAverageRating(userId);
    res.json(result);
  } catch (error) {
    console.error('Get User Avg Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    // We get reviews FOR this user
    const reviews = await ratingsService.getUserReviews(userId);
    res.json(reviews);
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  submitRating,
  getRideRatings,
  getUserAverage,
  getUserReviews,
};
