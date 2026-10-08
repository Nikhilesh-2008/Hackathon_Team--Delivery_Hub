import taskService from '../services/task.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const getTeamTasks = async (req, res, next) => {
  try {
    const data = await taskService.getTeamTasks(req.params.teamId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const data = await taskService.createTask(req.params.teamId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const data = await taskService.getTaskById(req.params.taskId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const data = await taskService.updateTask(req.params.taskId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const data = await taskService.deleteTask(req.params.taskId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getTeamTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
