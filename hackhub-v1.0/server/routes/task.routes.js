import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTeamMembership } from '../middleware/membershipGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// GET /api/teams/:teamId/tasks
router.get('/teams/:teamId/tasks', requireAuth, requireTeamMembership, taskController.getTeamTasks);

// POST /api/teams/:teamId/tasks
router.post(
  '/teams/:teamId/tasks',
  requireAuth,
  requireTeamMembership,
  requireFields('title'),
  taskController.createTask
);

// GET /api/tasks/:taskId
router.get('/tasks/:taskId', requireAuth, taskController.getTaskById);

// PATCH /api/tasks/:taskId (Optimistic concurrency control: requires "version" in payload)
router.patch('/tasks/:taskId', requireAuth, taskController.updateTask);

// DELETE /api/tasks/:taskId
router.delete('/tasks/:taskId', requireAuth, taskController.deleteTask);

export default router;
