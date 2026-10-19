import { Profile, User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getMyProfile = async (userId) => {
  let profile = await Profile.findOne({ userId }).populate('userId', 'name email college graduationYear avatarUrl role');
  if (!profile) {
    // Lazy initialize if not yet created
    profile = await Profile.create({
      userId,
      specialization: 'Generalist',
      skills: [],
      interests: [],
      availability: '8-10 hrs/week',
      discoveryConsent: true,
    });
    profile = await Profile.findById(profile._id).populate('userId', 'name email college graduationYear avatarUrl role');
  }

  return profile;
};

export const updateMyProfile = async (userId, updateData) => {
  const allowedProfileFields = [
    'bio',
    'specialization',
    'skills',
    'interests',
    'experienceLevel',
    'availability',
    'discoveryConsent',
    'codingProfiles',
    'projects',
    'certificates',
  ];

  const sanitized = {};
  for (const key of allowedProfileFields) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }

  if (sanitized.codingProfiles && typeof sanitized.codingProfiles === 'object') {
    const cleanedProfiles = {};
    for (const [site, url] of Object.entries(sanitized.codingProfiles)) {
      if (typeof url === 'string' && url.trim().length > 0) {
        cleanedProfiles[site] = url.trim();
      }
    }
    sanitized.codingProfiles = cleanedProfiles;
  }

  // Handle optional user-level field updates (name, college, graduationYear, avatarUrl)
  const userUpdates = {};
  if (updateData.name) userUpdates.name = updateData.name;
  if (updateData.college) userUpdates.college = updateData.college;
  if (updateData.graduationYear || updateData.year) userUpdates.graduationYear = updateData.graduationYear || updateData.year;
  if (updateData.avatarUrl !== undefined) userUpdates.avatarUrl = updateData.avatarUrl;
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(userId, { $set: userUpdates });
  }

  const updatedProfile = await Profile.findOneAndUpdate(
    { userId },
    { $set: sanitized },
    { new: true, upsert: true, runValidators: true }
  ).populate('userId', 'name email college graduationYear avatarUrl role');

  return updatedProfile;
};

export const getProfileById = async (id) => {
  let profile = await Profile.findOne({
    $or: [{ _id: id }, { userId: id }]
  }).populate('userId', 'name email college graduationYear avatarUrl role');

  if (!profile) {
    // Check if user exists without profile
    const user = await User.findById(id);
    if (user) {
      profile = await getMyProfile(user._id);
    } else {
      throw new AppError('RESOURCE_NOT_FOUND', 'Profile not found', 404);
    }
  }

  return profile;
};

export default {
  getMyProfile,
  updateMyProfile,
  getProfileById,
};
