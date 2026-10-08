import { Router } from 'express';
import * as reputationController from '../controllers/reputation.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/reputation/me
router.get('/reputation/me', requireAuth, reputationController.getMyReputation);

// GET /api/users/:userId/reputation
router.get('/users/:userId/reputation', requireAuth, reputationController.getUserReputation);

export default router;
