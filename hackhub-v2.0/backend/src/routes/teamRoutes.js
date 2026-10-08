import express from 'express';
import { getMyTeam, getAllTeams, createTeam, sendInvitation, getInvitations, respondInvitation } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-team', getMyTeam);
router.get('/', getAllTeams);
router.post('/', protect, createTeam);
router.post('/invitations', sendInvitation);
router.get('/invitations', getInvitations);
router.patch('/invitations/:id', respondInvitation);

export default router;
