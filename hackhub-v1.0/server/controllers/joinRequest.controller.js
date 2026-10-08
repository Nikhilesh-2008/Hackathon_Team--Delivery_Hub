import joinRequestService from '../services/joinRequest.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const createJoinRequest = async (req, res, next) => {
  try {
    const data = await joinRequestService.createJoinRequest(req.user, req.params.teamId, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getTeamJoinRequests = async (req, res, next) => {
  try {
    const data = await joinRequestService.getTeamJoinRequests(req.params.teamId, req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const acceptJoinRequest = async (req, res, next) => {
  try {
    const data = await joinRequestService.acceptJoinRequest(req.params.requestId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const rejectJoinRequest = async (req, res, next) => {
  try {
    const data = await joinRequestService.rejectJoinRequest(req.params.requestId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const cancelJoinRequest = async (req, res, next) => {
  try {
    const data = await joinRequestService.cancelJoinRequest(req.params.requestId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  createJoinRequest,
  getTeamJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
};
