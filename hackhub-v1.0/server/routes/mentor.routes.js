import { Router } from 'express';
import * as mentorController from '../controllers/mentor.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/mentor/teams
router.get('/mentor/teams', requireAuth, requireRole('MENTOR', 'ADMIN'), mentorController.getAssignedTeams);

// GET /api/teams/:teamId/feedback
router.get('/teams/:teamId/feedback', requireAuth, mentorController.getTeamFeedback);

// POST /api/teams/:teamId/feedback
router.post(
  '/teams/:teamId/feedback',
  requireAuth,
  requireRole('MENTOR', 'ADMIN'),
  requireFields('title', 'message'),
  mentorController.createFeedback
);

export default router;
