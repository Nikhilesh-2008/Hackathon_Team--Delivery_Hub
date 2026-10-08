import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/events/:eventId/challenges
router.get('/events/:eventId/challenges', optionalAuth, challengeController.listChallenges);

// GET /api/events/:eventId/challenges/:challengeId
router.get('/events/:eventId/challenges/:challengeId', optionalAuth, challengeController.getChallengeById);

// POST /api/events/:eventId/challenges
router.post(
  '/events/:eventId/challenges',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  requireFields('title', 'track', 'problemStatement', 'description', 'category'),
  challengeController.createChallenge
);

// PATCH /api/challenges/:challengeId
router.patch(
  '/challenges/:challengeId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  challengeController.updateChallenge
);

export default router;
