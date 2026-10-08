import crypto from 'crypto';
import { User, Profile, Session, Membership, Reputation, Invitation, AuditLog } from '../models/index.js';
import { hashPassword, comparePassword, hashToken, generateAuthToken, generateRandomToken } from '../utils/auth.js';
import { AppError } from '../utils/response.js';

export const register = async ({ name, email, password, college, graduationYear, role }) => {
  if (role && role !== 'PARTICIPANT') {
    throw new AppError('FORBIDDEN', 'Direct registration is strictly limited to PARTICIPANT role', 403);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('CONFLICT', 'An account with this email address already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'PARTICIPANT',
    college: college || '',
    graduationYear: graduationYear || '',
    isActive: true,
    emailVerified: false,
  });

  // Create initialized profile
  const profile = await Profile.create({
    userId: user._id,
    specialization: 'Generalist',
    skills: [],
    interests: [],
    availability: '8-10 hrs/week',
    discoveryConsent: true,
  });

  // Create session
  const refreshToken = generateRandomToken(32);
  const tokenHash = hashToken(refreshToken);
  const session = await Session.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isValid: true,
  });

  const token = generateAuthToken(user, session._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      graduationYear: user.graduationYear,
    },
    profile: {
      specialization: profile.specialization,
      discoveryConsent: profile.discoveryConsent,
    },
    token,
    refreshToken,
  };
};

export const verifyEmail = async ({ email, token }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User with specified email not found', 404);
  }

  user.emailVerified = true;
  await user.save();

  return {
    verified: true,
    message: 'Email verified successfully',
  };
};

export const login = async ({ email, password, userAgent = '', ipAddress = '' }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('FORBIDDEN', 'User account is deactivated', 403);
  }

  const refreshToken = generateRandomToken(32);
  const tokenHash = hashToken(refreshToken);
  const session = await Session.create({
    userId: user._id,
    tokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isValid: true,
  });

  const token = generateAuthToken(user, session._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      avatarUrl: user.avatarUrl,
    },
    token,
    refreshToken,
  };
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // Return friendly generic response to prevent email harvesting
    return {
      message: 'If the email exists, a password reset link has been dispatched',
    };
  }

  return {
    message: 'Password reset link sent to your email',
  };
};

export const resetPassword = async ({ token, newPassword, email }) => {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('VALIDATION_ERROR', 'Password must be at least 6 characters', 400);
  }

  const normalizedEmail = (email || '').toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User account not found', 404);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // Invalidate all active sessions for security
  await Session.updateMany({ userId: user._id }, { isValid: false });

  return {
    message: 'Password reset successfully. Please log in with your new credentials',
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const profile = (await Profile.findOne({ userId })) || {
    specialization: 'Generalist',
    skills: [],
    interests: [],
    availability: '8-10 hrs/week',
    discoveryConsent: true,
  };

  const activeMemberships = await Membership.find({ userId, status: 'active' })
    .populate('teamId', 'name eventId status')
    .lean();

  const activeTeams = activeMemberships.map((m) => ({
    teamId: m.teamId?._id || m.teamId,
    teamName: m.teamId?.name || '',
    eventId: m.eventId,
    role: m.role,
    status: m.status,
  }));

  const reputationAgg = await Reputation.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]);

  const totalReputation = reputationAgg.length > 0 ? reputationAgg[0].total : 0;

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      graduationYear: user.graduationYear,
      avatarUrl: user.avatarUrl,
    },
    profile: {
      bio: profile.bio || '',
      specialization: profile.specialization,
      skills: profile.skills || [],
      interests: profile.interests || [],
      availability: profile.availability,
      discoveryConsent: profile.discoveryConsent,
      codingProfiles: profile.codingProfiles || {},
      projects: profile.projects || [],
      certificates: profile.certificates || [],
    },
    reputation: totalReputation,
    activeTeams,
  };
};

export const logout = async (userId, sessionId = null, refreshToken = null) => {
  if (sessionId) {
    await Session.findByIdAndUpdate(sessionId, { isValid: false });
  } else if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await Session.findOneAndUpdate({ tokenHash }, { isValid: false });
  } else {
    // Invalidate all current user sessions
    await Session.updateMany({ userId, isValid: true }, { isValid: false });
  }

  return {
    message: 'Session invalidated successfully',
  };
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('VALIDATION_ERROR', 'New password must be at least 6 characters', 400);
  }

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('UNAUTHORIZED', 'Current password is incorrect', 401);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return {
    message: 'Password changed successfully',
  };
};

export const createStaffInvitation = async (inviter, { email, role, eventId, message }) => {
  if (!['MENTOR', 'JUDGE'].includes(role)) {
    throw new AppError('VALIDATION_ERROR', 'Platform staff invitation role must be MENTOR or JUDGE', 400);
  }

  const normalizedEmail = (email || '').toLowerCase().trim();
  const invitee = await User.findOne({ email: normalizedEmail });
  if (!invitee) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Invitee user account not found. User must register first', 404);
  }

  const existingInvitation = await Invitation.findOne({
    inviteeId: invitee._id,
    eventId,
    status: 'pending',
  });

  if (existingInvitation) {
    throw new AppError('CONFLICT', 'A pending staff invitation already exists for this user', 409);
  }

  const invitation = await Invitation.create({
    inviterId: inviter._id,
    inviteeId: invitee._id,
    eventId,
    role: role.toLowerCase(),
    message: message || `You have been invited as a ${role} for this hackathon`,
    status: 'pending',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  return invitation;
};

export const acceptStaffInvitation = async (user, invitationId) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Staff invitation not found', 404);
  }

  if (invitation.inviteeId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'This invitation was addressed to another user', 403);
  }

  if (invitation.status !== 'pending') {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Invitation cannot be accepted; status is ${invitation.status}`, 422);
  }

  invitation.status = 'accepted';
  await invitation.save();

  // Elevate user role if invited as judge or mentor
  const targetRole = invitation.role.toUpperCase();
  if (['JUDGE', 'MENTOR'].includes(targetRole) && user.role !== targetRole) {
    await User.findByIdAndUpdate(user._id, { role: targetRole });
  }

  return {
    accepted: true,
    message: `Invitation accepted. You are now designated as ${invitation.role}`,
    invitation,
  };
};

export const revokeStaffInvitation = async (inviter, invitationId) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Staff invitation not found', 404);
  }

  invitation.status = 'cancelled';
  await invitation.save();

  return {
    message: 'Staff invitation revoked successfully',
  };
};

export default {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  changePassword,
  createStaffInvitation,
  acceptStaffInvitation,
  revokeStaffInvitation,
};
