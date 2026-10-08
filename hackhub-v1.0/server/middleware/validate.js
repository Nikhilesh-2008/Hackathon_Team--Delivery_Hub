import { AppError } from '../utils/response.js';

export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    try {
      const result = validatorFn(req.body);
      if (result && !result.valid) {
        throw new AppError('VALIDATION_ERROR', result.message || 'Request validation failed', 400, result.errors);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export const requireFields = (...fields) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(
        new AppError(
          'VALIDATION_ERROR',
          `Missing required field(s): ${missing.join(', ')}`,
          400,
          missing.map((f) => ({ field: f, message: `${f} is required` }))
        )
      );
    }

    return next();
  };
};

export default {
  validateBody,
  requireFields,
};
