import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Promo Codes (Based on Phase 4 - API_CONTRACT.md)
 */
export const promoCodesApi = {
  /**
   * Validate a promo code for a ride
   * @param {string} token - Clerk JWT
   * @param {string} code - e.g. 'SAVE10'
   * @param {number} subtotal - Price before discount
   */
  validate: (token, code, subtotal) => {
    setAuthToken(token);
    return handleApiCall(() =>
      apiClient.post('/promo-codes/validate', {
        code,
        subtotal,
      })
    );
  },

  /**
   * Create a new Promo Code (Admin Action)
   * @param {string} token - Clerk JWT (Requires Admin privileges)
   * @param {object} promoData - { code, discount, type, expiresAt }
   */
  create: (token, promoData) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.post('/promo-codes', promoData));
  },

  /**
   * Get specific promo code details
   * @param {string} token - Clerk JWT
   * @param {string} code - Target code
   */
  getDetails: (token, code) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get(`/promo-codes/${code}`));
  },

  /**
   * Remove a promo code (Admin Action)
   * @param {string} token - Clerk JWT
   * @param {string} code - Target code to delete
   */
  remove: (token, code) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.delete(`/promo-codes/${code}`));
  },
};

export default promoCodesApi;
