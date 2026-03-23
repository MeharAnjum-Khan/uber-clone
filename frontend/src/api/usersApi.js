import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: User Management (Based on Phase 4 - API_CONTRACT.md)
 * Note: Auth syncing is handled in authApi, specific user lookups and updates are here.
 */
export const usersApi = {
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
   * @param {string} token - Clerk JWT
   * @param {string} userId - Target user ID
   */
  getUserById: (token, userId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/users/${userId}`));
  },

  /**
   * Get Emergency Contacts
   */
  getEmergencyContacts: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/users/me/emergency-contacts'));
  },

  /**
   * Add Emergency Contact
   */
  addEmergencyContact: (token, contactData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/users/me/emergency-contacts', contactData));
  },

  /**
   * Delete Emergency Contact
   */
  deleteEmergencyContact: (token, contactId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.delete(`/users/me/emergency-contacts/${contactId}`));
  },
};

export default usersApi;
