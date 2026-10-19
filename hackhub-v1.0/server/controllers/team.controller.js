import teamService from '../services/team.service.js';
import { sendSuccess } from '../utils/response.js';

export const createTeam = async (req, res, next) => {
  try {
    const data = await teamService.createTeam(req.user._id, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getMyTeam = async (req, res, next) => {
  try {
    const data = await teamService.getMyTeam(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const data = await teamService.getTeamById(req.params.teamId, req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamMembers = async (req, res, next) => {
  try {
    const data = await teamService.getTeamMembers(req.params.teamId, req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamMessages = async (req, res, next) => {
  try {
    const data = await teamService.getTeamMessages(req.params.teamId, req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const createTeamMessage = async (req, res, next) => {
  try {
    const data = await teamService.createTeamMessage(req.params.teamId, req.user._id, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getTeamInvitations = async (req, res, next) => {
  try {
    const data = await teamService.getTeamInvitations(req.params.teamId, req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateTeam = async (req, res, next) => {  try {    const updates = req.body;    const result = await teamService.updateTeam(req.params.teamId, req.user._id, updates);    return sendSuccess(res, result, 200);  } catch (err) {    return next(err);  }};
export const createInvitation = async (req, res, next) => {
  try {
    const data = await teamService.createInvitation(req.params.teamId, req.user._id, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export default { createTeam, getMyTeam, getTeamById, getTeamMembers, getTeamMessages, createTeamMessage, getTeamInvitations, createInvitation, updateTeam };
