import { Task, Team, Membership } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getTeamTasks = async (teamId) => {
  const tasks = await Task.find({ teamId })
    .populate('ownerId', 'name avatarUrl')
    .sort({ targetDate: 1, createdAt: 1 });
  return tasks;
};

const ensureTaskAccess = async (task, user) => {
  if (['ADMIN', 'ORGANIZER'].includes(user.role)) return;
  const membership = await Membership.findOne({
    userId: user._id,
    teamId: task.teamId,
    status: 'active',
  });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'You must be an active team member to access this task', 403);
  }
};

export const createTask = async (teamId, user, taskData) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const task = await Task.create({
    ...taskData,
    teamId: team._id,
    eventId: team.eventId,
    createdBy: user._id,
    ownerId: taskData.ownerId || user._id,
    ownerName: taskData.ownerName || user.name,
    version: 1,
    status: taskData.status || 'todo',
  });

  return task;
};

export const getTaskById = async (taskId, user) => {
  const task = await Task.findById(taskId)
    .populate('ownerId', 'name avatarUrl email')
    .populate('createdBy', 'name');

  if (!task) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Task not found', 404);
  }

  await ensureTaskAccess(task, user);

  return task;
};

export const updateTask = async (taskId, user, updatePayload) => {
  // Support both { version, data: {...} } and direct { version, status, ... }
  const suppliedVersion = updatePayload.version;
  if (suppliedVersion === undefined || suppliedVersion === null) {
    throw new AppError('VALIDATION_ERROR', 'Optimistic concurrency control parameter "version" is required', 400);
  }

  const updateFields = updatePayload.data ? { ...updatePayload.data } : { ...updatePayload };
  delete updateFields.version;
  delete updateFields._id;
  delete updateFields.teamId;
  delete updateFields.eventId;

  const taskRecord = await Task.findById(taskId);
  if (!taskRecord) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Task not found', 404);
  }
  await ensureTaskAccess(taskRecord, user);

  // Optimistic locking update
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, version: suppliedVersion },
    { $set: updateFields, $inc: { version: 1 } },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    const existing = await Task.findById(taskId);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Task not found', 404);
    }
    // Stale version detected -> 409 Conflict
    throw new AppError('CONFLICT', 'Conflict: Task modified by another user', 409, {
      currentVersion: existing.version,
      submittedVersion: suppliedVersion,
    });
  }

  return updatedTask;
};

export const deleteTask = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Task not found', 404);
  }

  await ensureTaskAccess(task, user);

  await Task.findByIdAndDelete(taskId);

  return {
    deleted: true,
    taskId,
  };
};

export default {
  getTeamTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
