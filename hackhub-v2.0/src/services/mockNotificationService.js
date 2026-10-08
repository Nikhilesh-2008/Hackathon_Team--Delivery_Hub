import { api } from './api';
import { mockNotifications, mockReputationHistory } from '../data/reputation';

export const mockNotificationService = {
  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockNotifications;
  },

  markAsRead: async (id) => {
    try {
      await api.patch('/notifications/read-all', {});
    } catch (e) {}
    return mockNotifications.map((n) => ({ ...n, read: true }));
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all', {});
    } catch (e) {}
    return mockNotifications.map((n) => ({ ...n, read: true }));
  },
};

export const mockReputationService = {
  getReputationHistory: async () => {
    try {
      const res = await api.get('/reputation');
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockReputationHistory;
  },
};
