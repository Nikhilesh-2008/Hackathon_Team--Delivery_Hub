import { Router } from 'express';
import * as agentController from '../controllers/agent.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/teams/:teamId/ai/delivery-plan (Read-only assessment & proposal creation)
router.post('/teams/:teamId/ai/delivery-plan', requireAuth, agentController.generateDeliveryPlan);

// POST /api/teams/:teamId/ai/delivery-plan/:agentRunId/confirm (Captain-only application of approved milestones)
router.post(
  '/teams/:teamId/ai/delivery-plan/:agentRunId/confirm',
  requireAuth,
  agentController.confirmDeliveryPlan
);

// POST /api/teams/:teamId/ai/delivery-plan/:agentRunId/cancel (Rejection of proposed delivery plan)
router.post(
  '/teams/:teamId/ai/delivery-plan/:agentRunId/cancel',
  requireAuth,
  agentController.cancelDeliveryPlan
);

export default router;
