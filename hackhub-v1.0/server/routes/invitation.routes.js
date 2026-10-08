import { Router } from 'express';
import * as invitationController from '../controllers/invitation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// POST /api/teams/:teamId/invitations
router.post(
  '/teams/:teamId/invitations',
  requireAuth,
  requireFields('inviteeId'),
  invitationController.createInvitation
);

// GET /api/teams/:teamId/invitations
router.get('/teams/:teamId/invitations', requireAuth, invitationController.getTeamInvitations);

// POST /api/invitations/:invitationId/accept
router.post('/invitations/:invitationId/accept', requireAuth, invitationController.acceptInvitation);

// POST /api/invitations/:invitationId/reject
router.post('/invitations/:invitationId/reject', requireAuth, invitationController.rejectInvitation);

// DELETE /api/invitations/:invitationId
router.delete('/invitations/:invitationId', requireAuth, invitationController.cancelInvitation);

export default router;
