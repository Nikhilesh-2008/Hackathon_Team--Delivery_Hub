import { Session, User, Profile } from '../models/index.js';
import { AppError } from '../utils/response.js';
import { generateAuthToken, generateRandomToken, hashToken } from '../utils/auth.js';

const SESSION_TTL_DAYS = 7;

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const profile = await Profile.findOne({ userId }).lean();

  const activeMemberships = await Session.aggregate([
    { $match: { userId, isValid: true } },
    {
      $group: {
        _id: null,
        members: { $push: '$teamId' },
      },
    },
  ]);

  const activeTeams = activeMemberships.length > 0
    ? activeMemberships[0].members.map((m) => ({
        teamId: m?.toString(),
        teamName: m?.name || '',
        eventId: m?.eventId,
        role: m?.role,
        status: m?.status,
      }))
    : [];

  const reputationAgg = await Profile.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'reputations',
        localField: '_id',
        foreignField: 'userId',
        as: 'reputation',
      },
    },
    { $unwind: '$reputation' },
    {
      $group: {
        _id: null,
        total: { $sum: '$reputation.points' },
      },
    },
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
      emailVerified: user.emailVerified,
    },
    profile: {
      bio: profile?.bio || '',
      specialization: profile?.specialization || 'Generalist',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      availability: profile?.availability || '8-10 hrs/week',
      discoveryConsent: profile?.discoveryConsent ?? true,
      codingProfiles: profile?.codingProfiles || {},
      projects: profile?.projects || [],
      certificates: profile?.certificates || [],
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
    await Session.updateMany({ userId, isValid: true }, { isValid: false });
  }

  return { message: 'Session invalidated successfully' };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('VALIDATION_ERROR', 'refreshToken is required', 400);
  }

  const tokenHash = hashToken(refreshToken);
  const session = await Session.findOne({ tokenHash, isValid: true });
  if (!session) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired session', 401);
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    await Session.findByIdAndUpdate(session._id, { isValid: false });
    throw new AppError('UNAUTHORIZED', 'Session has expired', 401);
  }

  const user = await User.findById(session.userId);
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  // Rotate the refresh token on every use to limit replay window.
  const newRefreshToken = generateRandomToken(32);
  const newTokenHash = hashToken(newRefreshToken);
  await Session.findByIdAndUpdate(session._id, {
    tokenHash: newTokenHash,
    expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
  });

  const token = generateAuthToken(user, session._id);
  return {
    token,
    refreshToken: newRefreshToken,
  };
};

export default { getMe, logout, refresh };
