import { Profile, Challenge, User } from '../models/index.js';

export const discoverChallenges = async (filters = {}) => {
  const { eventId, category, difficulty, track, query } = filters;
  const filter = {};

  if (eventId) {
    filter.eventId = eventId;
  }

  if (category && category !== 'All') {
    filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty.toLowerCase();
  }

  if (track && track !== 'All') {
    filter.track = { $regex: new RegExp(`^${track}$`, 'i') };
  }

  if (query && query.trim()) {
    const q = query.trim();
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { problemStatement: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { requirements: { $in: [new RegExp(q, 'i')] } },
      { recommendedSkills: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  const challenges = await Challenge.find(filter).populate('eventId', 'name slug');
  return challenges;
};

export const discoverTeammates = async (filters = {}, requestingUser = null) => {
  const { specialization, skill, interest, query, limit = 20 } = filters;

  // STRICT REQUIREMENT: Only discover users with discoveryConsent === true
  const filter = {
    discoveryConsent: true,
  };

  if (requestingUser) {
    filter.userId = { $ne: requestingUser._id };
  }

  if (specialization && specialization !== 'All') {
    filter.specialization = { $regex: new RegExp(specialization, 'i') };
  }

  if (skill && skill !== 'All') {
    filter.skills = { $elemMatch: { $regex: new RegExp(skill, 'i') } };
  }

  if (interest && interest !== 'All') {
    filter.interests = { $elemMatch: { $regex: new RegExp(interest, 'i') } };
  }

  if (query && query.trim()) {
    const q = query.trim();
    filter.$or = [
      { bio: { $regex: q, $options: 'i' } },
      { specialization: { $regex: q, $options: 'i' } },
      { skills: { $in: [new RegExp(q, 'i')] } },
      { interests: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  const profiles = await Profile.find(filter)
    .populate('userId', 'name email college avatarUrl graduationYear role isActive')
    .limit(parseInt(limit, 10));

  // Filter out deactivated accounts and build candidate presentation
  const candidates = profiles
    .filter((p) => p.userId && p.userId.isActive)
    .map((p) => {
      const u = p.userId;
      return {
        id: u._id,
        profileId: p._id,
        name: u.name,
        role: p.specialization,
        specialization: p.specialization,
        college: u.college,
        avatarUrl: u.avatarUrl,
        bio: p.bio,
        skills: p.skills,
        interests: p.interests,
        availability: p.availability,
        experienceLevel: p.experienceLevel,
        codingProfiles: p.codingProfiles,
        projects: p.projects,
        whyThisPerson: {
          skillsMatch: p.skills?.length > 0 ? `${p.skills.slice(0, 3).join(', ')} expert` : 'Complementary skill set',
          availabilityMatch: p.availability || '8-10 hrs/week',
          interestMatch: p.interests?.length > 0 ? p.interests[0] : 'Hackathons',
        },
      };
    });

  return candidates;
};

export default {
  discoverChallenges,
  discoverTeammates,
};
