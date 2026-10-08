import { api } from './api';

const TOKEN_KEY = 'hackhub_jwt_token';
const USER_KEY = 'hackhub_current_user';
const ROLE_KEY = 'hackhub_active_role';

export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      if (res.data.role) localStorage.setItem(ROLE_KEY, res.data.role);
    }
    return res;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      if (res.data.role) localStorage.setItem(ROLE_KEY, res.data.role);
    }
    return res;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    return true;
  },
};
