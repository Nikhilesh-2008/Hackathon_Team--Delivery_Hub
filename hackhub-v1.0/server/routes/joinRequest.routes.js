import { Router } from 'express';
import * as joinRequestController from '../controllers/joinRequest.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/teams/:teamId/join-requests
router.post('/teams/:teamId/join-requests', requireAuth, joinRequestController.createJoinRequest);

// GET /api/teams/:teamId/join-requests
router.get('/teams/:teamId/join-requests', requireAuth, joinRequestController.getTeamJoinRequests);

// POST /api/join-requests/:requestId/accept
router.post('/join-requests/:requestId/accept', requireAuth, joinRequestController.acceptJoinRequest);

// POST /api/join-requests/:requestId/reject
router.post('/join-requests/:requestId/reject', requireAuth, joinRequestController.rejectJoinRequest);

// DELETE /api/join-requests/:requestId
router.delete('/join-requests/:requestId', requireAuth, joinRequestController.cancelJoinRequest);

export default router;
