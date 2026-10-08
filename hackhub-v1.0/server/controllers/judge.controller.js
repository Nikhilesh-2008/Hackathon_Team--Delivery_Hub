import judgeService from '../services/judge.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const getAssignedSubmissions = async (req, res, next) => {
  try {
    const data = await judgeService.getAssignedSubmissions(req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getSubmissionScores = async (req, res, next) => {
  try {
    const data = await judgeService.getSubmissionScores(req.params.submissionId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const submitScore = async (req, res, next) => {
  try {
    const data = await judgeService.submitScore(req.params.submissionId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export default {
  getAssignedSubmissions,
  getSubmissionScores,
  submitScore,
};
