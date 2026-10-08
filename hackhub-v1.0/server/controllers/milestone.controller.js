import milestoneService from '../services/milestone.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const getTeamMilestones = async (req, res, next) => {
  try {
    const data = await milestoneService.getTeamMilestones(req.params.teamId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const createMilestone = async (req, res, next) => {
  try {
    const data = await milestoneService.createMilestone(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateMilestone = async (req, res, next) => {
  try {
    const data = await milestoneService.updateMilestone(req.params.milestoneId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteMilestone = async (req, res, next) => {
  try {
    const data = await milestoneService.deleteMilestone(req.params.milestoneId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getTeamMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};
