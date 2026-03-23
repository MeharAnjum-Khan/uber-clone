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
   * Get User Received Reviews (mine)
   */
  getUserReviews: async (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/ratings/mine'));
  },

  /**
   * Get User Average Rating
   */
  getUserAverage: async (token, userId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/ratings/user/${userId}/average`));
  }
};
