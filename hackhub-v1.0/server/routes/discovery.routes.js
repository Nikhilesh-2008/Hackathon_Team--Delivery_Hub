import { Router } from 'express';
import * as discoveryController from '../controllers/discovery.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/discovery/challenges
router.post('/discovery/challenges', optionalAuth, discoveryController.discoverChallenges);

// POST /api/discovery/teammates (Enforces discoveryConsent === true)
router.post('/discovery/teammates', requireAuth, discoveryController.discoverTeammates);

export default router;
