import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Auth & Identity (Based on Phase 4 - API_CONTRACT.md)
 */
export const authApi = {
  /**
   * Sync Clerk User with our internal database
   * @param {string} token - Clerk JWT
   * @param {object} userData - { email, name, avatar }
   */
  syncUser: (token, userData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/users/sync', userData));
  },

  /**
   * Get Current Authenticated User (from our DB)
   * @param {string} token - Clerk JWT
   */
  getMe: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/users/me'));
  },

  /**
   * Update Profile Details
   * @param {string} token - Clerk JWT
   * @param {object} updateData - { phone, profilePic, preferences }
   */
  updateProfile: (token, updateData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.patch('/users/me', updateData));
  },

  /**
   * Get User by ID
   * @param {string} userId - Target user ID
   */
  getUserById: (userId) => {
    return handleApiCall(() => apiClient.get(`/users/${userId}`));
  },
};

export default authApi;
