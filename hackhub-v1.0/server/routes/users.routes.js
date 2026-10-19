import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// GET /api/auth/users/me
router.get('/auth/users/me', requireAuth, userController.getMe);

// PATCH /api/auth/users/me
router.patch('/auth/users/me', requireAuth, userController.updateMe);

// DELETE /api/auth/users/me
router.delete('/auth/users/me', requireAuth, userController.deactivateMe);

// GET /api/auth/users/:userId
router.get('/auth/users/:userId', requireAuth, userController.getUserById);

// GET /api/auth/users/:userId/reputation
router.get('/auth/users/:userId/reputation', requireAuth, requireRole('PARTICIPANT', 'MENTOR', 'JUDGE', 'ORGANIZER', 'ADMIN'), userController.getUserReputation);

export default router;
