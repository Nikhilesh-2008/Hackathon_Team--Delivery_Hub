import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import * as challengeController from '../controllers/challenge.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/events
router.get('/events', optionalAuth, eventController.listEvents);

// GET /api/events/:eventId
router.get('/events/:eventId', optionalAuth, eventController.getEventById);

// POST /api/events
router.post(
  '/events',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  requireFields('name', 'description', 'startDate', 'endDate', 'submissionDeadline', 'registrationDeadline', 'location'),
  eventController.createEvent
);

// PATCH /api/events/:eventId
router.patch(
  '/events/:eventId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  eventController.updateEvent
);

// POST /api/events/:eventId/publish
router.post(
  '/events/:eventId/publish',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  eventController.publishEvent
);

// POST /api/events/:eventId/lock-submissions
router.post(
  '/events/:eventId/lock-submissions',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  eventController.lockSubmissions
);

// PATCH /api/events/:eventId/assignments
router.patch(
  '/events/:eventId/assignments',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  eventController.assignStaff
);

export default router;
