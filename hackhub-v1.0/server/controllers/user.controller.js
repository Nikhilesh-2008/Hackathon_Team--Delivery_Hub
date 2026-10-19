import userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMe = async (req, res, next) => {
  try {
    const data = await userService.getMe(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const data = await userService.updateMe(req.user._id, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const deactivateMe = async (req, res, next) => {
  try {
    const data = await userService.deactivateMe(req.user._id, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const data = await userService.getUserById(req.params.userId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getUserReputation = async (req, res, next) => {
  try {
    const data = await userService.getUserReputation(req.params.userId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default { getMe, updateMe, deactivateMe, getUserById, getUserReputation };
