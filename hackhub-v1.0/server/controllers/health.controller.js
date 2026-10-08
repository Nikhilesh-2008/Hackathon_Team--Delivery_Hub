import { checkHealth as checkHealthService } from '../services/health.service.js';

export const checkHealth = async (req, res, next) => {
  try {
    const health = await checkHealthService();
    return res.status(200).json(health);
  } catch (err) {
    return next(err);
  }
};

export default {
  checkHealth,
};
