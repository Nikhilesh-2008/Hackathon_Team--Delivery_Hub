import agentService from '../services/agent.service.js';
import { sendSuccess } from '../utils/response.js';

export const generateDeliveryPlan = async (req, res, next) => {
  try {
    const data = await agentService.generateDeliveryPlan(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const confirmDeliveryPlan = async (req, res, next) => {
  try {
    const data = await agentService.confirmDeliveryPlan(req.params.teamId, req.params.agentRunId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const cancelDeliveryPlan = async (req, res, next) => {
  try {
    const data = await agentService.cancelDeliveryPlan(req.params.teamId, req.params.agentRunId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  generateDeliveryPlan,
  confirmDeliveryPlan,
  cancelDeliveryPlan,
};
