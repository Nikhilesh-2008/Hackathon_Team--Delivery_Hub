import express from 'express';
import { getMyProfile, updateMyProfile, getProfileById, getProfiles } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.get('/', getProfiles);
router.get('/:id', getProfileById);

export default router;
