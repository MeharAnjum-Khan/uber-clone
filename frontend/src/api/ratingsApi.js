import apiClient, { handleApiCall, setAuthToken } from './apiClient';

export const ratingsApi = {
  /**
   * Submit Rating
   * @param {string} token
   * @param {object} payload - { rideId, rating, comment }
   */
  submitRating: async (token, rideId, payload) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post(`/ratings/submit`, { rideId, ...payload }));
  },

  /**
   * Get User Reviews
   */
  getUserReviews: async (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/api/ratings/user'));
  }
};
