import { Milestone, Team } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getTeamMilestones = async (teamId) => {
  const milestones = await Milestone.find({ teamId }).sort({ dueDate: 1 });
  return milestones;
};

export const createMilestone = async (teamId, user, milestoneData) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const milestone = await Milestone.create({
    ...milestoneData,
    teamId: team._id,
    eventId: team.eventId,
  });

  return milestone;
};

export const updateMilestone = async (milestoneId, user, updateData) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Milestone not found', 404);
  }

  Object.assign(milestone, updateData);
  await milestone.save();

  return milestone;
};

export const deleteMilestone = async (milestoneId, user) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Milestone not found', 404);
  }

  await Milestone.findByIdAndDelete(milestoneId);

  return {
    deleted: true,
    milestoneId,
  };
};

export default {
  getTeamMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};
