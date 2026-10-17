import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getSubmission,
  saveSubmission,
  submitProject,
  getMentorFeedback,
  createMentorFeedback,
  submitJudgeScore,
  getReputationHistory,
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/operationsController.js';

const router = express.Router();

router.get('/submission', protect, getSubmission);
router.put('/submission', protect, saveSubmission);
router.post('/submission/submit', protect, submitProject);

router.get('/feedback', protect, getMentorFeedback);
router.post('/feedback', protect, authorize('Mentor', 'Admin'), createMentorFeedback);

router.post('/scores', protect, authorize('Judge', 'Admin'), submitJudgeScore);

router.get('/reputation', protect, getReputationHistory);

router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read-all', protect, markNotificationsAsRead);

export default router;
