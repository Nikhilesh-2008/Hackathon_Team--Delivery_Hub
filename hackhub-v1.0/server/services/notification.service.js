import { Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getMyNotifications = async (userId) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return {
    notifications,
    unreadCount,
  };
};

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Notification not found', 404);
  }
  notification.isRead = true;
  await notification.save();
  return { message: 'Notification marked as read', isRead: true };
};

export const markAllNotificationsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return { message: 'All notifications marked as read' };
};

export default { getMyNotifications, markNotificationRead, markAllNotificationsRead };
