import { currentUser, demoRoles } from '../data/users';

const AUTH_STORAGE_KEY = 'hackhub_current_user';
const ROLE_STORAGE_KEY = 'hackhub_active_role';

export const mockAuthService = {
  getCurrentUser: async () => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : currentUser;
  },

  updateCurrentUser: async (updatedData) => {
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    return true;
  }
};
