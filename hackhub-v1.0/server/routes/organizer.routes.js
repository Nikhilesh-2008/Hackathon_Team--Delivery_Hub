import { Router } from 'express';
import * as organizerController from '../controllers/organizer.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// GET /api/organizer/events
router.get(
  '/organizer/events',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  organizerController.getOrganizerEvents
);

// GET /api/organizer/events/:eventId
router.get(
  '/organizer/events/:eventId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  organizerController.getOrganizerEventDetails
);

export default router;
