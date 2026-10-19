import notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getMyNotifications(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllNotificationsRead(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const data = await notificationService.markNotificationRead(req.user._id, req.params.notificationId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default { getMyNotifications, markAllNotificationsRead, markNotificationRead };
