import { mockNotifications, mockReputationHistory } from '../data/reputation';

const NOTIFS_KEY = 'hackhub_notifications';

export const mockNotificationService = {
  getNotifications: async () => {
    const saved = localStorage.getItem(NOTIFS_KEY);
    return saved ? JSON.parse(saved) : mockNotifications;
  },

  markAsRead: async (id) => {
    const list = await mockNotificationService.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllAsRead: async () => {
    const list = await mockNotificationService.getNotifications();
    const updated = list.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(updated));
    return updated;
  }
};

export const mockReputationService = {
  getReputationHistory: async () => {
    return mockReputationHistory;
  }
};
