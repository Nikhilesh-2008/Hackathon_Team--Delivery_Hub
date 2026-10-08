import profileService from '../services/profile.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const data = await profileService.getMyProfile(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const data = await profileService.updateMyProfile(req.user._id, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getMyProfile,
  updateMyProfile,
};
