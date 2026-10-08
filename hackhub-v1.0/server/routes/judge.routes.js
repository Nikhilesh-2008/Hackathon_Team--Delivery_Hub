import { Router } from 'express';
import * as judgeController from '../controllers/judge.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/judge/submissions
router.get('/judge/submissions', requireAuth, requireRole('JUDGE', 'ADMIN'), judgeController.getAssignedSubmissions);

// GET /api/submissions/:submissionId/scores
router.get(
  '/submissions/:submissionId/scores',
  requireAuth,
  requireRole('JUDGE', 'ORGANIZER', 'ADMIN'),
  judgeController.getSubmissionScores
);

// POST /api/submissions/:submissionId/scores
router.post(
  '/submissions/:submissionId/scores',
  requireAuth,
  requireRole('JUDGE', 'ADMIN'),
  requireFields('criteriaScores'),
  judgeController.submitScore
);

export default router;
