import { User, Profile, Reputation, Membership } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/response.js';

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const profile = await Profile.findOne({ userId }).lean() || {
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
    { $match: { userId } },
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
      emailVerified: user.emailVerified,
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

export const updateMe = async (userId, updates) => {
  const allowed = ['name', 'bio', 'specialization', 'availability', 'college', 'graduationYear', 'skills', 'interests', 'codingProfiles'];
  const clean = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      clean[key] = updates[key];
    }
  }

  let profile = await Profile.findOne({ userId });

  if (clean.skills || clean.interests) {
    const existing = profile ? profile.toObject() : {};
    profile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          bio: clean.bio,
          specialization: clean.specialization,
          availability: clean.availability,
          college: clean.college,
          graduationYear: clean.graduationYear,
          skills: clean.skills || (existing?.skills || []),
          interests: clean.interests || (existing?.interests || []),
          codingProfiles: clean.codingProfiles || (existing?.codingProfiles || {}),
        },
      },
      { new: true, runValidators: true }
    );
  } else if (profile) {
    profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: clean },
      { new: true, runValidators: true }
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

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
      ...profile.toObject(),
    },
  };
};

export const deactivateMe = async (userId, body) => {
  const { password } = body;
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('UNAUTHORIZED', 'Current password is incorrect', 401);
  }

  user.isActive = false;
  await user.save();

  await Membership.updateMany({ userId }, { status: 'removed' });
  await Session.updateMany({ userId, isValid: true }, { isValid: false });

  return { message: 'Account deactivated. You have been signed out.' };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const profile = await Profile.findOne({ userId }).lean();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    graduationYear: user.graduationYear,
    avatarUrl: user.avatarUrl,
    bio: profile?.bio || '',
    specialization: profile?.specialization || 'Generalist',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    availability: profile?.availability || '8-10 hrs/week',
    reputation: 0,
  };
};

export const getUserReputation = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const reputationAgg = await Reputation.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$points' }, history: { $push: '$$ROOT' } } },
  ]);

  const history = reputationAgg.length > 0
    ? reputationAgg[0].history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    reputation: reputationAgg.length > 0 ? reputationAgg[0].total : 0,
    history,
  };
};

export default { getMe, updateMe, deactivateMe, getUserById, getUserReputation };
