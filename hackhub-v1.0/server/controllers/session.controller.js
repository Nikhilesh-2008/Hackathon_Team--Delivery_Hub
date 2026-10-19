import sessionService from '../services/session.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMe = async (req, res, next) => {
  try {
    const data = await sessionService.getMe(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await sessionService.logout(req.user._id, req.session?._id, refreshToken);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await sessionService.refresh(refreshToken);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default { getMe, logout, refresh };
