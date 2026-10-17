import express from 'express';
import { getMyTeam, getAllTeams, createTeam, sendInvitation, getInvitations, respondInvitation } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-team', protect, getMyTeam);
router.get('/', protect, getAllTeams);
router.post('/', protect, createTeam);
router.post('/invitations', protect, sendInvitation);
router.get('/invitations', protect, getInvitations);
router.patch('/invitations/:id', protect, respondInvitation);

export default router;
