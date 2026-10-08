import { JoinRequest, Team, Membership, Event, Notification, User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const createJoinRequest = async (user, teamId, { message = '' }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const event = await Event.findById(team.eventId);
  if (!event || ['closed', 'locked'].includes(event.status)) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Event is not accepting new team members', 422);
  }

  // Check if user is already an active member in this or another team in this event
  const existingMembership = await Membership.findOne({
    userId: user._id,
    eventId: team.eventId,
    status: 'active',
  });

  if (existingMembership) {
    throw new AppError('CONFLICT', 'You are already an active member of a team in this event', 409);
  }

  // Check duplicate pending request
  const existingPending = await JoinRequest.findOne({
    teamId: team._id,
    requesterId: user._id,
    status: 'pending',
  });

  if (existingPending) {
    throw new AppError('CONFLICT', 'You already have a pending join request for this team', 409);
  }

  const joinRequest = await JoinRequest.create({
    teamId: team._id,
    eventId: team.eventId,
    requesterId: user._id,
    status: 'pending',
    message: message || '',
  });

  // Notify captain
  const captainMembership = await Membership.findOne({ teamId: team._id, role: 'captain', status: 'active' });
  if (captainMembership) {
    await Notification.create({
      userId: captainMembership.userId,
      type: 'team',
      title: 'New Teammate Join Request',
      message: `${user.name} has requested to join ${team.name}.`,
      relatedEntity: 'Team',
      relatedEntityId: team._id,
    });
  }

  return joinRequest;
};

export const getTeamJoinRequests = async (teamId, user) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const requests = await JoinRequest.find({ teamId, status: 'pending' })
    .populate('requesterId', 'name email college avatarUrl graduationYear')
    .sort({ createdAt: -1 });

  return requests;
};

export const acceptJoinRequest = async (requestId, user) => {
  const joinRequest = await JoinRequest.findById(requestId);
  if (!joinRequest) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Join request not found', 404);
  }

  if (joinRequest.status !== 'pending') {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Join request is already ${joinRequest.status}`, 422);
  }

  const team = await Team.findById(joinRequest.teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Target team no longer exists', 404);
  }

  // Check captain authorization
  const captainMembership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!captainMembership || captainMembership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can accept join requests', 403);
  }

  // Check team capacity
  const event = await Event.findById(team.eventId);
  const currentMemberCount = await Membership.countDocuments({ teamId: team._id, status: 'active' });
  if (event && currentMemberCount >= event.maxTeamSize) {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Team capacity reached (max ${event.maxTeamSize} members)`, 422);
  }

  // Check requester is not already in another team
  const existingActive = await Membership.findOne({
    userId: joinRequest.requesterId,
    eventId: team.eventId,
    status: 'active',
  });

  if (existingActive) {
    joinRequest.status = 'rejected';
    await joinRequest.save();
    throw new AppError('CONFLICT', 'User has already joined another team in this event', 409);
  }

  joinRequest.status = 'accepted';
  await joinRequest.save();

  // Create membership
  const membership = await Membership.create({
    userId: joinRequest.requesterId,
    teamId: team._id,
    eventId: team.eventId,
    role: 'member',
    status: 'active',
  });

  // Notify accepted member
  await Notification.create({
    userId: joinRequest.requesterId,
    type: 'team',
    title: 'Join Request Approved!',
    message: `Your request to join ${team.name} has been approved!`,
    relatedEntity: 'Team',
    relatedEntityId: team._id,
  });

  return {
    accepted: true,
    joinRequest,
    membership,
  };
};

export const rejectJoinRequest = async (requestId, user) => {
  const joinRequest = await JoinRequest.findById(requestId);
  if (!joinRequest) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Join request not found', 404);
  }

  if (joinRequest.status !== 'pending') {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Join request is already ${joinRequest.status}`, 422);
  }

  const team = await Team.findById(joinRequest.teamId);
  const captainMembership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!captainMembership || captainMembership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can reject join requests', 403);
  }

  joinRequest.status = 'rejected';
  await joinRequest.save();

  return {
    rejected: true,
    joinRequest,
  };
};

export const cancelJoinRequest = async (requestId, user) => {
  const joinRequest = await JoinRequest.findById(requestId);
  if (!joinRequest) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Join request not found', 404);
  }

  // Can be cancelled by requester or team captain
  const isRequester = joinRequest.requesterId.toString() === user._id.toString();
  const isCaptain = await Membership.findOne({
    userId: user._id,
    teamId: joinRequest.teamId,
    role: 'captain',
    status: 'active',
  });

  if (!isRequester && !isCaptain && user.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Access denied to cancel this request', 403);
  }

  joinRequest.status = 'cancelled';
  await joinRequest.save();

  return {
    cancelled: true,
    message: 'Join request cancelled successfully',
  };
};

export default {
  createJoinRequest,
  getTeamJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
};
