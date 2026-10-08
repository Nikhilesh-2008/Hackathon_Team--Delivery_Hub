import submissionService from '../services/submission.service.js';
import { sendSuccess } from '../utils/response.js';

export const getSubmissionChecklist = async (req, res, next) => {
  try {
    const data = await submissionService.getSubmissionChecklist(req.params.teamId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTeamSubmission = async (req, res, next) => {
  try {
    const data = await submissionService.getTeamSubmission(req.params.teamId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const upsertSubmission = async (req, res, next) => {
  try {
    const data = await submissionService.upsertSubmission(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateSubmissionDraft = async (req, res, next) => {
  try {
    const data = await submissionService.updateSubmissionDraft(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getSubmissionById = async (req, res, next) => {
  try {
    const data = await submissionService.getSubmissionById(req.params.submissionId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const submitFinalSubmission = async (req, res, next) => {
  try {
    const data = await submissionService.submitFinalSubmission(req.params.submissionId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getSubmissionChecklist,
  getTeamSubmission,
  upsertSubmission,
  updateSubmissionDraft,
  getSubmissionById,
  submitFinalSubmission,
};
