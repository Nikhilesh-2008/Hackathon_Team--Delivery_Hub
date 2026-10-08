import notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getMyNotifications(req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const data = await notificationService.markNotificationRead(req.params.notificationId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getMyNotifications,
  markNotificationRead,
};
