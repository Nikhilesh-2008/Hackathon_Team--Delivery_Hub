import { Task } from '../models/Task.js';
import { Team } from '../models/Team.js';

// GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    const filter = teamId ? { team: teamId } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, owner, priority, deadline, tag, description, teamId } = req.body;
    const task = await Task.create({
      title,
      owner: owner || 'Karthik',
      priority: priority || 'Medium',
      deadline: deadline || 'Tomorrow',
      tag: tag || 'General',
      description: description || '',
      team: teamId || null,
      status: 'TODO',
    });

    res.status(201).json({ success: true, message: 'Task added to sprint', data: task });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Recalculate team progress if attached to team
    if (task.team) {
      const allTasks = await Task.find({ team: task.team });
      const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = Math.round((completed / (allTasks.length || 1)) * 100);
      await Team.findByIdAndUpdate(task.team, { progress });
    }

    res.status(200).json({ success: true, message: 'Task status updated', data: task });
  } catch (error) {
    next(error);
  }
};
