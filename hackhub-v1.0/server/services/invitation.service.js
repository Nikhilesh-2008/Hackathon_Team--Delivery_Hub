import { Invitation, Team, Membership, Event, Notification, User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const createInvitation = async (user, teamId, { inviteeId, message = '', role = 'member' }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  // Check captain authorization
  const captainMembership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!captainMembership || captainMembership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can invite members', 403);
  }

  const invitee = await User.findById(inviteeId);
  if (!invitee) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitee user not found', 404);
  }

  // Check duplicate pending invitation
  const existingPending = await Invitation.findOne({
    teamId: team._id,
    inviteeId,
    status: 'pending',
  });

  if (existingPending) {
    throw new AppError('CONFLICT', 'An invitation has already been sent to this candidate', 409);
  }

  const invitation = await Invitation.create({
    inviterId: user._id,
    inviteeId,
    teamId: team._id,
    eventId: team.eventId,
    role,
    message: message || `You have been invited to join ${team.name}`,
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Notify invitee
  await Notification.create({
    userId: inviteeId,
    type: 'team',
    title: 'New Team Invitation',
    message: `${user.name} invited you to join team ${team.name}.`,
    relatedEntity: 'Team',
    relatedEntityId: team._id,
  });

  return invitation;
};

export const getTeamInvitations = async (teamId, user) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const invitations = await Invitation.find({ teamId, status: 'pending' })
    .populate('inviteeId', 'name email college avatarUrl')
    .sort({ createdAt: -1 });

  return invitations;
};

export const acceptInvitation = async (invitationId, user) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitation not found', 404);
  }

  if (invitation.inviteeId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Access denied: This invitation was not addressed to you', 403);
  }

  if (invitation.status !== 'pending') {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Invitation is already ${invitation.status}`, 422);
  }

  const team = await Team.findById(invitation.teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team no longer exists', 404);
  }

  // Check capacity
  const event = await Event.findById(team.eventId);
  const currentCount = await Membership.countDocuments({ teamId: team._id, status: 'active' });
  if (event && currentCount >= event.maxTeamSize) {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Team is full (max ${event.maxTeamSize} members)`, 422);
  }

  // Check active membership in event
  const existingActive = await Membership.findOne({
    userId: user._id,
    eventId: team.eventId,
    status: 'active',
  });

  if (existingActive) {
    invitation.status = 'rejected';
    await invitation.save();
    throw new AppError('CONFLICT', 'You are already in an active team for this hackathon', 409);
  }

  invitation.status = 'accepted';
  await invitation.save();

  const membership = await Membership.create({
    userId: user._id,
    teamId: team._id,
    eventId: team.eventId,
    role: invitation.role || 'member',
    status: 'active',
  });

  // Notify captain
  await Notification.create({
    userId: invitation.inviterId,
    type: 'team',
    title: 'Invitation Accepted!',
    message: `${user.name} accepted your invitation to join ${team.name}!`,
    relatedEntity: 'Team',
    relatedEntityId: team._id,
  });

  return {
    accepted: true,
    invitation,
    membership,
  };
};

export const rejectInvitation = async (invitationId, user) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitation not found', 404);
  }

  if (invitation.inviteeId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Access denied to this invitation', 403);
  }

  invitation.status = 'rejected';
  await invitation.save();

  return {
    rejected: true,
    invitation,
  };
};

export const cancelInvitation = async (invitationId, user) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitation not found', 404);
  }

  const isInviter = invitation.inviterId.toString() === user._id.toString();
  const isCaptain = await Membership.findOne({
    userId: user._id,
    teamId: invitation.teamId,
    role: 'captain',
    status: 'active',
  });

  if (!isInviter && !isCaptain && user.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Access denied to cancel this invitation', 403);
  }

  invitation.status = 'cancelled';
  await invitation.save();

  return {
    cancelled: true,
    message: 'Invitation cancelled successfully',
  };
};

export default {
  createInvitation,
  getTeamInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
};
