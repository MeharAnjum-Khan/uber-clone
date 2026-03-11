import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Messaging & SOS (Communication Module)
 */
export const messagesApi = {
  /**
   * Send a Message in ride chat
   * @param {string} token - Clerk JWT
   * @param {string} rideId - Target Ride
   * @param {string} content - Message text
   */
  sendMessage: (token, rideId, content) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/messages/send', { rideId, content }));
  },

  /**
   * Get Message history
   * @param {string} token - Clerk JWT
   * @param {string} rideId - Target Ride
   */
  getRideHistory: (token, rideId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/messages/ride/${rideId}`));
  },
};

/**
 * Service: Safety & Support (SOS Module)
 */
export const safetyApi = {
  /**
   * Trigger SOS Alert during a ride
   * @param {string} token - Clerk JWT
   * @param {string} rideId - Current active ride ID
   * @param {string} reason - Brief reason for emergency
   */
  triggerSOS: (token, rideId, reason) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/sos/trigger', { rideId, reason }));
  },

  /**
   * Submit a Safety/Support Rating for a Ride
   * @param {string} token - Clerk JWT
   * @param {object} ratingData - { rideId, rating, comment }
   */
  submitRating: (token, ratingData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/ratings/submit', ratingData));
  },

  /**
   * Fetch Driver/Rider average rating
   * @param {string} token - Clerk JWT
   * @param {string} userId - Target user
   */
  getUserScore: (token, userId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/ratings/user/${userId}/average`));
  },
};

/**
 * Service: Help & Support (Ticket Module)
 */
export const supportApi = {
  /**
   * Create a new Support Ticket
   * @param {string} token - Clerk JWT
   * @param {object} ticketData - { rideId, category, subject, message }
   */
  createTicket: (token, ticketData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/support/tickets', ticketData));
  },

  /**
   * Get my tickets list
   * @param {string} token - Clerk JWT
   */
  getMyTickets: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/support/tickets'));
  },

  /**
   * Get single ticket details
   * @param {string} token - Clerk JWT
   * @param {string} ticketId - Current target
   */
  getTicketDetails: (token, ticketId) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/support/tickets/${ticketId}`));
  },
};

export default {
  messagesApi,
  safetyApi,
  supportApi,
};
