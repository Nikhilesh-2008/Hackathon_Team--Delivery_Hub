import { Router } from 'express';
import * as rubricController from '../controllers/rubric.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/events/:eventId/rubric
router.get('/events/:eventId/rubric', optionalAuth, rubricController.getEventRubric);

// GET /api/rubrics/:rubricId
router.get('/rubrics/:rubricId', requireAuth, rubricController.getRubricById);

// POST /api/events/:eventId/rubric
router.post(
  '/events/:eventId/rubric',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  requireFields('criteria'),
  rubricController.createRubric
);

// PATCH /api/rubrics/:rubricId
router.patch(
  '/rubrics/:rubricId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  rubricController.updateRubric
);

export default router;
