import apiClient, { handleApiCall, setAuthToken } from './apiClient';

export const sosApi = {
  /**
   * Trigger SOS Alert
   * @param {string} token
   * @param {object} payload - { rideId, lat, lng }
   */
  triggerAlert: async (token, payload) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/sos/trigger', payload));
  },

  /**
   * Get Active Alerts for Ride
   */
  getRideAlerts: async (token, rideId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/sos/ride/${rideId}`));
  }
};
