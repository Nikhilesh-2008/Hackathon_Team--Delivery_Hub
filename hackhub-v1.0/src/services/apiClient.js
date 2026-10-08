import { apiRoutes } from './apiRoutes.js';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hackhub_token') || localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('hackhub_token', token);
  } else {
    localStorage.removeItem('hackhub_token');
    localStorage.removeItem('token');
  }
};

export const apiClient = {
  request: async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = (data && data.error) || {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Network request failed',
        };
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`[apiClient] Request to ${endpoint} failed:`, err.message || err);
      throw err;
    }
  },

  get: (endpoint, options = {}) => apiClient.request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => apiClient.request(endpoint, { method: 'POST', body, ...options }),
  patch: (endpoint, body, options = {}) => apiClient.request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options = {}) => apiClient.request(endpoint, { method: 'DELETE', ...options }),
};

export default apiClient;
