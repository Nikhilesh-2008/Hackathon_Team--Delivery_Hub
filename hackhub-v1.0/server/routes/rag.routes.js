import { Router } from 'express';
import * as ragController from '../controllers/rag.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// POST /api/events/:eventId/rulebook/query
router.post(
  '/events/:eventId/rulebook/query',
  requireAuth,
  requireFields('query'),
  ragController.queryRulebook
);

export default router;
