import express from 'express';
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

router.get('/submission', getSubmission);
router.put('/submission', saveSubmission);
router.post('/submission/submit', submitProject);

router.get('/feedback', getMentorFeedback);
router.post('/feedback', createMentorFeedback);

router.post('/scores', submitJudgeScore);

router.get('/reputation', getReputationHistory);

router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markNotificationsAsRead);

export default router;
