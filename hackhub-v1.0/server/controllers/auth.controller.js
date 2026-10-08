import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const data = await authService.verifyEmail(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await authService.login({
      ...req.body,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user._id);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const sessionId = req.session?._id;
    const refreshToken = req.body.refreshToken;
    const data = await authService.logout(req.user._id, sessionId, refreshToken);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const data = await authService.changePassword(req.user._id, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const createStaffInvitation = async (req, res, next) => {
  try {
    const data = await authService.createStaffInvitation(req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const acceptStaffInvitation = async (req, res, next) => {
  try {
    const data = await authService.acceptStaffInvitation(req.user, req.params.invitationId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const revokeStaffInvitation = async (req, res, next) => {
  try {
    const data = await authService.revokeStaffInvitation(req.user, req.params.invitationId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  changePassword,
  createStaffInvitation,
  acceptStaffInvitation,
  revokeStaffInvitation,
};
