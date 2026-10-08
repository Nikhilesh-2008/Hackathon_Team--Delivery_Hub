import { AppError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // AppError instance
  if (err instanceof AppError) {
    const payload = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      payload.error.details = err.details;
    }
    return res.status(err.statusCode).json(payload);
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `Duplicate value for ${fieldName}. This record already exists.`,
      },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.map((e) => e.message).join('; ') || 'Database validation failed',
        details: errors,
      },
    });
  }

  // Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_IDENTIFIER',
        message: `Invalid format for identifier: '${err.value}'`,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token',
      },
    });
  }

  // Generic unhandled error
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
};

export default errorHandler;
