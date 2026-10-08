import discoveryService from '../services/discovery.service.js';
import { sendCollection, sendSuccess } from '../utils/response.js';

export const discoverChallenges = async (req, res, next) => {
  try {
    const data = await discoveryService.discoverChallenges(req.body);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const discoverTeammates = async (req, res, next) => {
  try {
    const data = await discoveryService.discoverTeammates(req.body, req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  discoverChallenges,
  discoverTeammates,
};
