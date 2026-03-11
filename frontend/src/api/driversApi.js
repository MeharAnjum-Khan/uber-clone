import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Driver Onboarding & Management (Based on Phase 4 - API_CONTRACT.md)
 */
export const driversApi = {
  /**
   * Register as a driver
   * @param {string} token - Clerk JWT
   * @param {object} driverData - { vehicleModel, licensePlate, type, etc. }
   */
  register: (token, driverData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/drivers/register', driverData));
  },

  /**
   * Update Driver Online/Offline Status
   * @param {string} token - Clerk JWT
   * @param {string} status - 'online' | 'offline'
   */
  updateStatus: (token, status) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.patch('/drivers/status', { status }));
  },

  /**
   * Update Driver GPS Location
   * @param {string} token - Clerk JWT
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  updateLocation: (token, lat, lng) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.patch('/drivers/location', { latitude: lat, longitude: lng }));
  },

  /**
   * Get Nearby Drivers
   * @param {string} token - Clerk JWT
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Radius in km (optional)
   */
  getNearby: (token, lat, lng, radius = 5) => {
    setAuthToken(token);
    return handleApiCall(() =>
      apiClient.get('/drivers/nearby', {
        params: { lat, lng, radius },
      })
    );
  },

  /**
   * Get Driver Profile
   * @param {string} token - Clerk JWT
   */
  getProfile: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/drivers/me'));
  },
};

export default driversApi;
