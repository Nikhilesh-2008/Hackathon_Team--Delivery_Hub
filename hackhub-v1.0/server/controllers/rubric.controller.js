import rubricService from '../services/rubric.service.js';
import { sendSuccess } from '../utils/response.js';

export const getEventRubric = async (req, res, next) => {
  try {
    const data = await rubricService.getEventRubric(req.params.eventId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getRubricById = async (req, res, next) => {
  try {
    const data = await rubricService.getRubricById(req.params.rubricId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const createRubric = async (req, res, next) => {
  try {
    const data = await rubricService.createRubric(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateRubric = async (req, res, next) => {
  try {
    const data = await rubricService.updateRubric(req.params.rubricId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getEventRubric,
  getRubricById,
  createRubric,
  updateRubric,
};
