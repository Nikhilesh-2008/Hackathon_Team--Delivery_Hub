import express from 'express';
import { getEvents, getEventById, createEvent, addChallenge } from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('Organizer', 'Admin'), createEvent);
router.post('/:id/challenges', protect, authorize('Organizer', 'Admin'), addChallenge);

export default router;
