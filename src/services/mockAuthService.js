import { api } from './api';
import { currentUser, demoRoles } from '../data/users';

const AUTH_STORAGE_KEY = 'hackhub_current_user';
const ROLE_STORAGE_KEY = 'hackhub_active_role';
const TOKEN_KEY = 'hackhub_jwt_token';

export const mockAuthService = {
  getCurrentUser: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      // Fallback gracefully to local stored user
    }
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : currentUser;
  },

  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return currentUser;
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return currentUser;
  },

  updateCurrentUser: async (updatedData) => {
    try {
      const res = await api.put('/profile/me', updatedData);
      if (res.success && res.data) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    const current = await mockAuthService.getCurrentUser();
    const updated = { ...current, ...updatedData };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getActiveRole: () => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || 'Participant';
  },

  switchRole: (role) => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    return role;
  },

  getDemoRoles: () => demoRoles,

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    return true;
  },
};
