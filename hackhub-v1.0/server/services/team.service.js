import { Team, Membership, Event, Challenge, User, AuditLog, Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const createTeam = async (user, { eventId, challengeId, name, description, technicalDecisions = [] }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  // Check event registration status
  if (['closed', 'locked'].includes(event.status)) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Event registration has closed', 422);
  }

  // Check if user is already an active member of ANY team in this event
  const existingActiveMembership = await Membership.findOne({
    userId: user._id,
    eventId: event._id,
    status: 'active',
  });

  if (existingActiveMembership) {
    throw new AppError('CONFLICT', 'User is already an active member of a team in this hackathon', 409);
  }

  // Check team name uniqueness within event
  const existingTeam = await Team.findOne({ eventId: event._id, name: name.trim() });
  if (existingTeam) {
    throw new AppError('CONFLICT', `A team named '${name}' already exists in this event`, 409);
  }

  if (challengeId) {
    const challenge = await Challenge.findOne({ _id: challengeId, eventId: event._id });
    if (!challenge) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Selected challenge does not belong to this event', 404);
    }
  }

  // Create team
  const team = await Team.create({
    eventId: event._id,
    challengeId,
    name: name.trim(),
    description: description || '',
    createdBy: user._id,
    status: 'forming',
    technicalDecisions,
  });

  // Create Captain Membership record
  const membership = await Membership.create({
    userId: user._id,
    teamId: team._id,
    eventId: event._id,
    role: 'captain',
    status: 'active',
    responsibilities: ['Team Lead', 'Product Delivery'],
  });

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'TEAM_CREATED',
    entityType: 'Team',
    entityId: team._id,
    reason: 'Initial team formation by captain',
  });

  return {
    team,
    membership,
  };
};

export const getTeamById = async (teamId) => {
  const team = await Team.findById(teamId)
    .populate('eventId', 'name slug submissionDeadline status minTeamSize maxTeamSize')
    .populate('challengeId', 'title track problemStatement requirements')
    .populate('createdBy', 'name email avatarUrl');

  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team workspace not found', 404);
  }

  const members = await Membership.find({ teamId: team._id, status: 'active' })
    .populate('userId', 'name email college avatarUrl graduationYear role')
    .lean();

  return {
    team,
    members: members.map((m) => ({
      membershipId: m._id,
      user: m.userId,
      role: m.role,
      status: m.status,
      responsibilities: m.responsibilities,
      specialization: m.specialization,
      joinedAt: m.joinedAt,
    })),
  };
};

export const updateTeam = async (teamId, user, updateData) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  // Verify captain authorization
  const membership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!membership || membership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can modify team settings', 403);
  }

  if (updateData.name && updateData.name !== team.name) {
    const existing = await Team.findOne({
      eventId: team.eventId,
      name: updateData.name.trim(),
      _id: { $ne: team._id },
    });
    if (existing) {
      throw new AppError('CONFLICT', `Team name '${updateData.name}' is already taken in this event`, 409);
    }
    team.name = updateData.name.trim();
  }

  if (updateData.description !== undefined) {
    team.description = updateData.description;
  }

  if (updateData.challengeId) {
    team.challengeId = updateData.challengeId;
  }

  if (updateData.technicalDecisions) {
    team.technicalDecisions = updateData.technicalDecisions;
  }

  if (updateData.status) {
    team.status = updateData.status;
  }

  await team.save();

  return team;
};

export const getTeamMembers = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const memberships = await Membership.find({ teamId, status: 'active' })
    .populate('userId', 'name email college avatarUrl graduationYear role')
    .lean();

  return memberships.map((m) => ({
    membershipId: m._id,
    user: m.userId,
    role: m.role,
    status: m.status,
    responsibilities: m.responsibilities,
    specialization: m.specialization,
    joinedAt: m.joinedAt,
  }));
};

export default {
  createTeam,
  getTeamById,
  updateTeam,
  getTeamMembers,
};
