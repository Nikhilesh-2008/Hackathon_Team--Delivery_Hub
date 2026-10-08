import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/notifications', requireAuth, notificationController.getMyNotifications);

// PATCH /api/notifications/:notificationId/read
router.patch('/notifications/:notificationId/read', requireAuth, notificationController.markNotificationRead);

// POST /api/notifications/:notificationId/read
router.post('/notifications/:notificationId/read', requireAuth, notificationController.markNotificationRead);

export default router;
