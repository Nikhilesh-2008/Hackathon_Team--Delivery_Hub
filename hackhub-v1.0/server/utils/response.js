/**
 * HackHub Canonical Response and Error Utilities
 */

export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendCollection = (res, data = [], meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      page: meta.page || 1,
      limit: meta.limit || (Array.isArray(data) ? data.length : 0),
      total: meta.total !== undefined ? meta.total : (Array.isArray(data) ? data.length : 0),
    },
  });
};

export const sendError = (res, code, message, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  AppError,
  sendSuccess,
  sendCollection,
  sendError,
  asyncHandler,
};
