import { Task } from '../models/Task.js';
import { Team } from '../models/Team.js';

// GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    const memberships = await Team.find({ $or: [{ captain: req.user._id }, { 'members.user': req.user._id }] }).select('_id');
    const teamIds = memberships.map((team) => team._id);
    const filter = teamId ? { team: { $eq: teamId, $in: teamIds } } : { team: { $in: teamIds } };
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
    if (!teamId || !(await Team.exists({ _id: teamId, $or: [{ captain: req.user._id }, { 'members.user': req.user._id }] }))) {
      return res.status(403).json({ success: false, message: 'You must belong to the selected team to add a task' });
    }
    const task = await Task.create({
      title,
      owner: owner || 'Unassigned',
      priority: priority || 'Medium',
      deadline: deadline || 'Soon',
      tag: tag || 'General',
      description: description || '',
      team: teamId,
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
    if (!['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }
    const memberships = await Team.find({ $or: [{ captain: req.user._id }, { 'members.user': req.user._id }] }).select('_id');
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, team: { $in: memberships.map((team) => team._id) } },
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
