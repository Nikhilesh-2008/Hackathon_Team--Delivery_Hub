import reputationService from '../services/reputation.service.js';
import { sendSuccess } from '../utils/response.js';

export const getMyReputation = async (req, res, next) => {
  try {
    const data = await reputationService.getMyReputation(req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getUserReputation = async (req, res, next) => {
  try {
    const data = await reputationService.getUserReputation(req.params.userId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getMyReputation,
  getUserReputation,
};
