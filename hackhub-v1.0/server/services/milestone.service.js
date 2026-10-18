import { Milestone, Team, Membership } from '../models/index.js';
import { AppError } from '../utils/response.js';

const requireMembership = async (teamId, user, captainOnly = false) => {
  if (user.role === 'ADMIN') return null;
  const membership = await Membership.findOne({ userId: user._id, teamId, status: 'active' });
  if (!membership || (captainOnly && membership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', captainOnly ? 'Only the team captain can remove milestones' : 'Active team membership is required', 403);
  }
  return membership;
};

export const getTeamMilestones = async (teamId, user) => {
  await requireMembership(teamId, user);
  const milestones = await Milestone.find({ teamId }).sort({ dueDate: 1 });
  return milestones;
};

export const createMilestone = async (teamId, user, milestoneData) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  await requireMembership(team._id, user);

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

  await requireMembership(milestone.teamId, user);

  Object.assign(milestone, updateData);
  await milestone.save();

  return milestone;
};

export const deleteMilestone = async (milestoneId, user) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Milestone not found', 404);
  }

  await requireMembership(milestone.teamId, user, true);

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
