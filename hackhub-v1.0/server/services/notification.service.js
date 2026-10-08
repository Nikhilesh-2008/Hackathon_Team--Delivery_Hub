import { Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getMyNotifications = async (user) => {
  const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

  return {
    notifications,
    unreadCount,
  };
};

export const markNotificationRead = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Notification not found', 404);
  }

  if (notification.userId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Access denied to this notification', 403);
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

export default {
  getMyNotifications,
  markNotificationRead,
};
