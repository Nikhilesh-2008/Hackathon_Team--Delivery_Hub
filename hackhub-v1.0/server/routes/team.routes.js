import { Router } from 'express';
import * as teamController from '../controllers/team.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTeamMembership, requireCaptain } from '../middleware/membershipGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// POST /api/teams
router.post(
  '/teams',
  requireAuth,
  requireFields('eventId', 'name'),
  teamController.createTeam
);

// GET /api/teams/:teamId
router.get(
  '/teams/:teamId',
  requireAuth,
  requireTeamMembership,
  teamController.getTeamById
);

// PATCH /api/teams/:teamId
router.patch(
  '/teams/:teamId',
  requireAuth,
  requireTeamMembership,
  requireCaptain,
  teamController.updateTeam
);

// GET /api/teams/:teamId/members
router.get(
  '/teams/:teamId/members',
  requireAuth,
  teamController.getTeamMembers
);

export default router;
