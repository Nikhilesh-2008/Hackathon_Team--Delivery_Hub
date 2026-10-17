import { currentUser, demoRoles } from '../data/users';
import { api } from './api';

const AUTH_STORAGE_KEY = 'hackhub_current_user';
const ROLE_STORAGE_KEY = 'hackhub_active_role';
const TOKEN_KEY = 'hackhub_jwt_token';

export const mockAuthService = {
  getCurrentUser: async () => {
    if (localStorage.getItem(TOKEN_KEY)) return null;
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : currentUser;
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
