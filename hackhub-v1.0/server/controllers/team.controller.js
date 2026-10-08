import teamService from '../services/team.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const createTeam = async (req, res, next) => {
  try {
    const data = await teamService.createTeam(req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const data = await teamService.getTeamById(req.params.teamId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const data = await teamService.updateTeam(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamMembers = async (req, res, next) => {
  try {
    const data = await teamService.getTeamMembers(req.params.teamId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  createTeam,
  getTeamById,
  updateTeam,
  getTeamMembers,
};
