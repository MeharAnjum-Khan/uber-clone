import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Configure Axios Instance with default settings
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Function to inject Auth Token from Clerk into headers
 * @param {string} token - Clerk JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Global Error Handler wrapper for API calls
 * @param {Function} apiFunc - The axios call function
 */
export const handleApiCall = async (apiFunc) => {
  try {
    const response = await apiFunc();
    return response.data;
  } catch (error) {
    const axiosError = error || {};
    const responseData = axiosError.response?.data;
    const status = axiosError.response?.status;
    const url = axiosError.config?.url;

    const message =
      (responseData && (responseData.error || responseData.message)) ||
      axiosError.message ||
      'Something went wrong. Please try again later.';

    const customError = new Error(message);
    customError.status = status ?? null;
    customError.url = url ?? null;
    customError.data = responseData ?? null;

    console.warn('API Error:', customError);
    throw customError;
  }
};

export default apiClient;
