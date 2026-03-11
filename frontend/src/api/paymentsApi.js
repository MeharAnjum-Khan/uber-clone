import apiClient, { handleApiCall, setAuthToken } from './apiClient';

/**
 * Service: Stripe Payments (Based on Phase 4 - API_CONTRACT.md)
 */
export const paymentsApi = {
  /**
   * Create Stripe Payment Intent for a ride
   * @param {string} token - Clerk JWT
   * @param {number} amount - Amount in cents (e.g. 2500 for $25.00)
   * @param {string} currency - 'usd' | 'gbp' | etc.
   * @param {string} rideId - UUID of the Ride
   */
  createIntent: (token, amount, currency, rideId) => {
    setAuthToken(token);
    return handleApiCall(() =>
      apiClient.post('/payments/create-intent', {
        amount,
        currency,
        rideId,
      })
    );
  },

  /**
   * Get User Payment History
   * @param {string} token - Clerk JWT
   */
  getHistory: (token) => {
    setAuthToken(token);
    return handleApiCall(() => apiClient.get('/payments/history'));
  },
};

/**
 * Service: Promo Codes (Based on Phase 4 - API_CONTRACT.md)
 */
export const promoCodesApi = {
  /**
   * Validate a promo code
   * @param {string} token - Clerk JWT
   * @param {string} code - e.g. 'SAVE10'
   * @param {number} subtotal - Price before discount (optional)
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
};

export default {
  paymentsApi,
  promoCodesApi,
};
