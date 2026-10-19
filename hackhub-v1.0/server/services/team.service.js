import { User, Team, Membership, Invitation, Event, Notification, ChatMessage } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const createTeam = async (userId, { eventId, challengeId, name, description }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (event.status !== 'published' && event.status !== 'active') {
    throw new AppError('FORBIDDEN', 'Cannot create a team for this event', 403);
  }

  if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
    throw new AppError('FORBIDDEN', 'Registration for this event is closed', 403);
  }

  // A participant can only belong to ONE active team per event
  const existingMembership = await Membership.findOne({ userId, eventId, status: 'active' });
  if (existingMembership) {
    throw new AppError('CONFLICT', 'User is already in an active team for this hackathon', 409);
  }

  // Team names are unique within an event
  const existingTeam = await Team.findOne({ eventId, name });
  if (existingTeam) {
    throw new AppError('CONFLICT', 'A team with this name already exists for this event', 409);
  }

  // 1. Create the team, then 2. attach the captain membership with the real teamId
  // (Membership.teamId is required, so it cannot be created before the team exists).
  const team = await Team.create({
    eventId,
    challengeId,
    name,
    description: description || '',
    createdBy: userId,
    status: 'active',
  });

  const membership = await Membership.create({
    userId,
    teamId: team._id,
    eventId,
    role: 'captain',
    status: 'active',
  });

  await User.findByIdAndUpdate(userId, { $set: { role: 'PARTICIPANT' } });

  return {
    team: {
      _id: team._id,
      eventId,
      challengeId,
      name: team.name,
      description: team.description,
      createdBy: userId,
      status: team.status,
      progress: team.progress,
      createdAt: team.createdAt,
    },
    membership: {
      _id: membership._id,
      userId,
      teamId: team._id,
      eventId,
      role: membership.role,
      status: membership.status,
    },
  };
};

export const getMyTeam = async (userId) => {
  const membership = await Membership.findOne({ userId, status: 'active' });
  if (!membership) {
    return null;
  }

  const team = await Team.findById(membership.teamId).populate('eventId', 'name slug');
  if (!team) {
    return null;
  }

  return {
    id: team._id,
    name: team.name,
    eventId: team.eventId?._id,
    eventName: team.eventId?.name,
    challengeId: team.challengeId,
    status: team.status,
  };
};

export const getTeamById = async (teamId, userId) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not an active member of this team', 403);
  }

  const team = await Team.findById(teamId).populate('eventId', 'name slug');
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const memberRecords = await Membership.find({ teamId, status: 'active' })
    .populate('userId', 'name email college graduationYear avatarUrl')
    .lean();

  const members = memberRecords.map((m) => ({
    id: m.userId?._id,
    name: m.userId?.name,
    email: m.userId?.email,
    college: m.userId?.college,
    graduationYear: m.userId?.graduationYear,
    avatarUrl: m.userId?.avatarUrl,
    role: m.role,
    specialization: m.specialization,
    responsibilities: m.responsibilities,
    isCaptain: m.role === 'captain',
  }));

  return {
    id: team._id,
    _id: team._id,
    name: team.name,
    eventId: team.eventId?._id,
    eventName: team.eventId?.name,
    challengeId: team.challengeId,
    description: team.description,
    status: team.status,
    progress: team.progress,
    technicalDecisions: team.technicalDecisions,
    members,
  };
};

export const getTeamMembers = async (teamId, userId) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not a member of this team', 403);
  }

  const members = await Membership.find({ teamId, status: 'active' })
    .populate('userId', 'name email college graduationYear avatarUrl')
    .lean();

  return members.map((m) => ({
    id: m.userId?._id,
    name: m.userId?.name,
    email: m.userId?.email,
    college: m.userId?.college,
    graduationYear: m.userId?.graduationYear,
    avatarUrl: m.userId?.avatarUrl,
    role: m.role,
    isCaptain: m.role === 'captain',
  }));
};

export const getTeamMessages = async (teamId, userId) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not a member of this team', 403);
  }

  const messages = await ChatMessage.find({ teamId })
    .populate('senderId', 'name')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return messages.reverse().map((m) => ({
    id: m._id,
    senderId: m.senderId?._id,
    senderName: m.senderId?.name,
    text: m.text,
    createdAt: m.createdAt,
  }));
};

export const createTeamMessage = async (teamId, userId, { text }) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not a member of this team', 403);
  }

  const message = await ChatMessage.create({
    teamId,
    senderId: userId,
    text,
  });

  return {
    id: message._id,
    senderId: userId,
    senderName: '',
    text: message.text,
    createdAt: message.createdAt,
  };
};

export const getTeamInvitations = async (teamId, userId) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not a member of this team', 403);
  }

  const invitations = await Invitation.find({
    teamId,
    inviteeId: userId,
    status: 'pending',
  })
    .populate('inviterId', 'name')
    .lean();

  return invitations.map((i) => ({
    id: i._id,
    inviterId: i.inviterId?._id,
    inviterName: i.inviterId?.name,
    message: i.message,
    status: i.status,
    expiresAt: i.expiresAt,
  }));
};

export const createInvitation = async (teamId, userId, { inviteeId, message }) => {
  const membership = await Membership.findOne({ userId, teamId, status: 'active' });
  if (!membership) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not a member of this team', 403);
  }

  if (membership.role !== 'captain') {
    throw new AppError('FORBIDDEN', 'Only the team captain can send invitations', 403);
  }

  const invitee = await User.findById(inviteeId);
  if (!invitee) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitee not found', 404);
  }  const team = await Team.findById(teamId);  if (!team) {    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);  }
  const existing = await Invitation.findOne({ teamId, inviteeId, status: 'pending' });  if (existing) {    throw new AppError('CONFLICT', 'An invitation to this user already exists', 409);  }};

export const updateTeam = async (teamId, userId, updates) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  // Only captain or admin can update team details
  const membership = await Membership.findOne({
    teamId,
    userId,
    status: 'active',
  });
  if (!membership || (!['captain', 'admin'].includes(membership.role))) {
    throw new AppError('FORBIDDEN', 'Access denied: Only team captain or admin can update team details', 403);
  }

  if (updates.name) {
    team.name = updates.name;
  }
  if (updates.description !== undefined) {
    team.description = updates.description;
  }
  if (Object.keys(updates).length > 0) {
    await team.save();
  }
  return {
    id: team._id,
    name: team.name,
    description: team.description,
    status: team.status,
  };
};

export default { createTeam, getMyTeam, getTeamById, getTeamMembers, getTeamMessages, createTeamMessage, getTeamInvitations, createInvitation, updateTeam };
