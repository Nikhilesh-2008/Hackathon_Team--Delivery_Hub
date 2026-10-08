import challengeService from '../services/challenge.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const listChallenges = async (req, res, next) => {
  try {
    const data = await challengeService.listChallenges(req.params.eventId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getChallengeById = async (req, res, next) => {
  try {
    const data = await challengeService.getChallengeById(req.params.eventId, req.params.challengeId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const createChallenge = async (req, res, next) => {
  try {
    const data = await challengeService.createChallenge(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateChallenge = async (req, res, next) => {
  try {
    const data = await challengeService.updateChallenge(req.params.challengeId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  listChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
};
