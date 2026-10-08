import { Router } from 'express';
import * as submissionController from '../controllers/submission.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/teams/:teamId/checklist
router.get('/teams/:teamId/checklist', requireAuth, submissionController.getSubmissionChecklist);

// GET /api/teams/:teamId/submission
router.get('/teams/:teamId/submission', requireAuth, submissionController.getTeamSubmission);

// POST /api/teams/:teamId/submission
router.post('/teams/:teamId/submission', requireAuth, submissionController.upsertSubmission);

// PATCH /api/teams/:teamId/submission
router.patch('/teams/:teamId/submission', requireAuth, submissionController.updateSubmissionDraft);

// GET /api/submissions/:submissionId
router.get('/submissions/:submissionId', requireAuth, submissionController.getSubmissionById);

// POST /api/submissions/:submissionId/submit
router.post('/submissions/:submissionId/submit', requireAuth, submissionController.submitFinalSubmission);

export default router;
