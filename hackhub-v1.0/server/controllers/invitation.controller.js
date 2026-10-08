import invitationService from '../services/invitation.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const createInvitation = async (req, res, next) => {
  try {
    const data = await invitationService.createInvitation(req.user, req.params.teamId, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getTeamInvitations = async (req, res, next) => {
  try {
    const data = await invitationService.getTeamInvitations(req.params.teamId, req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const data = await invitationService.acceptInvitation(req.params.invitationId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const rejectInvitation = async (req, res, next) => {
  try {
    const data = await invitationService.rejectInvitation(req.params.invitationId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const cancelInvitation = async (req, res, next) => {
  try {
    const data = await invitationService.cancelInvitation(req.params.invitationId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  createInvitation,
  getTeamInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
};
