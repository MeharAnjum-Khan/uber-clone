import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Ride Request & Lifecycle (Based on Phase 4 - API_CONTRACT.md)
 */
export const ridesApi = {
  /**
   * Get Fare Estimate
   * @param {string} token - Clerk JWT
   * @param {object} coordinates - { pickupLat, pickupLng, dropLat, dropLng }
   */
  getEstimate: (token, coordinates) => {
    setAuthToken(token);
    return handleApiCall(() =>
      apiClient.get('/rides/estimate', {
        params: coordinates,
      })
    );
  },

  /**
   * Request a new Ride
   * @param {string} token - Clerk JWT
   * @param {object} rideData - { pickup, drop, rideType, promoCode }
   */
  requestRide: (token, rideData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/rides/request', rideData));
  },

  /**
   * Update Ride Status (Driver Actions)
   * @param {string} token - Clerk JWT
   * @param {string} rideId - Target Ride
   * @param {string} status - 'accepted' | 'arriving' | 'started' | 'completed' | 'cancelled'
   */
  updateStatus: (token, rideId, status) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.patch(`/rides/${rideId}/status`, { status }));
  },

  /**
   * Fetch Ride details
   * @param {string} token - Clerk JWT
   * @param {string} id - Target Ride ID
   */
  getRideDetails: (token, id) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/rides/${id}`));
  },

  /**
   * Get User Ride History (from backend/history route)
   * @param {string} token - Clerk JWT
   * @returns Array of rides
   */
  getHistory: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/rides/history'));
  },
};

export default ridesApi;
