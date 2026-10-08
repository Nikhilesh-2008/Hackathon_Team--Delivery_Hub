import mentorService from '../services/mentor.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const getAssignedTeams = async (req, res, next) => {
  try {
    const data = await mentorService.getAssignedTeams(req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamFeedback = async (req, res, next) => {
  try {
    const data = await mentorService.getTeamFeedback(req.params.teamId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const createFeedback = async (req, res, next) => {
  try {
    const data = await mentorService.createFeedback(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export default {
  getAssignedTeams,
  getTeamFeedback,
  createFeedback,
};
