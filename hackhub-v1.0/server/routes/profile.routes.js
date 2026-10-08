import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/profiles/me
router.get('/profiles/me', requireAuth, profileController.getMyProfile);

// PATCH /api/profiles/me
router.patch('/profiles/me', requireAuth, profileController.updateMyProfile);

export default router;
