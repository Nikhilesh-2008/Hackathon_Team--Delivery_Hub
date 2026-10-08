import ragService from '../services/rag.service.js';
import { sendSuccess } from '../utils/response.js';

export const queryRulebook = async (req, res, next) => {
  try {
    const data = await ragService.queryRulebook(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  queryRulebook,
};
