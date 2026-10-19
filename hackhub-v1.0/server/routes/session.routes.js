import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// POST /api/auth/refresh
// NOTE: /api/auth/me and /api/auth/logout are owned by auth.routes.js to avoid
// registering the same method + path twice under the /api router.
router.post('/auth/refresh', requireFields('refreshToken'), sessionController.refresh);

export default router;
