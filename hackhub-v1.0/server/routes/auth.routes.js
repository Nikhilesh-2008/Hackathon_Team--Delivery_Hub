import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// Public Authentication endpoints
// POST /api/auth/register
router.post('/auth/register', requireFields('name', 'email', 'password'), authController.register);

// POST /api/auth/verify-email
router.post('/auth/verify-email', requireFields('email'), authController.verifyEmail);

// POST /api/auth/login
router.post('/auth/login', requireFields('email', 'password'), authController.login);

// POST /api/auth/forgot-password
router.post('/auth/forgot-password', requireFields('email'), authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/auth/reset-password', requireFields('token', 'newPassword'), authController.resetPassword);

// Protected Authentication & Session endpoints
// GET /api/auth/me
router.get('/auth/me', requireAuth, authController.getMe);

// POST /api/auth/logout
router.post('/auth/logout', requireAuth, authController.logout);

// POST /api/auth/change-password
router.post(
  '/auth/change-password',
  requireAuth,
  requireFields('currentPassword', 'newPassword'),
  authController.changePassword
);

// Organizer Staff Invitation endpoints
// POST /api/auth/invitations
router.post(
  '/auth/invitations',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  requireFields('email', 'role', 'eventId'),
  authController.createStaffInvitation
);

// POST /api/auth/invitations/:invitationId/accept
router.post(
  '/auth/invitations/:invitationId/accept',
  requireAuth,
  authController.acceptStaffInvitation
);

// DELETE /api/auth/invitations/:invitationId
router.delete(
  '/auth/invitations/:invitationId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  authController.revokeStaffInvitation
);

export default router;
