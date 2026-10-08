import { Router } from 'express';
import * as milestoneController from '../controllers/milestone.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/teams/:teamId/milestones
router.get('/teams/:teamId/milestones', requireAuth, milestoneController.getTeamMilestones);

// POST /api/teams/:teamId/milestones
router.post(
  '/teams/:teamId/milestones',
  requireAuth,
  requireFields('title', 'dueDate'),
  milestoneController.createMilestone
);

// PATCH /api/milestones/:milestoneId
router.patch('/milestones/:milestoneId', requireAuth, milestoneController.updateMilestone);

// DELETE /api/milestones/:milestoneId
router.delete('/milestones/:milestoneId', requireAuth, milestoneController.deleteMilestone);

export default router;
