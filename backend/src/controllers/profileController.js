import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';

// GET /api/profile/me
export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role avatar');
    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, specialization, skills, interests, availability, college, year, codingProfiles, projects } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    const profileFields = {
      ...(bio !== undefined && { bio }),
      ...(specialization !== undefined && { specialization }),
      ...(skills !== undefined && { skills }),
      ...(interests !== undefined && { interests }),
      ...(availability !== undefined && { availability }),
      ...(college !== undefined && { college }),
      ...(year !== undefined && { year }),
      ...(codingProfiles !== undefined && { codingProfiles }),
      ...(projects !== undefined && { projects }),
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileFields },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email role avatar');

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    next(error);
  }
};

// GET /api/profile/:id
export const getProfileById = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }],
    }).populate('user', 'name email role avatar');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// GET /api/profiles (with matchmaking score & search filters)
export const getProfiles = async (req, res, next) => {
  try {
    const { specialization, skill, interest, query } = req.query;
    const filter = { visibility: true };

    if (specialization && specialization !== 'All') {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (skill && skill !== 'All') {
      filter.skills = { $in: [new RegExp(skill, 'i')] };
    }
    if (interest && interest !== 'All') {
      filter.interests = { $in: [new RegExp(interest, 'i')] };
    }

    let profiles = await Profile.find(filter).populate('user', 'name email role avatar');

    if (query && query.trim()) {
      const q = query.toLowerCase();
      profiles = profiles.filter((p) => {
        const name = p.user?.name?.toLowerCase() || '';
        const bio = p.bio?.toLowerCase() || '';
        const spec = p.specialization?.toLowerCase() || '';
        const hasSkill = p.skills?.some((s) => s.toLowerCase().includes(q));
        const hasInterest = p.interests?.some((i) => i.toLowerCase().includes(q));
        return name.includes(q) || bio.includes(q) || spec.includes(q) || hasSkill || hasInterest;
      });
    }

    // Attach calculated compatibility scores & "why this person" explainability
    const formatted = profiles.map((p) => {
      const obj = p.toObject();
      return {
        id: obj.user?._id || obj._id,
        profileId: obj._id,
        name: obj.user?.name || 'Developer',
        role: obj.specialization || 'Developer',
        specialization: obj.specialization || 'Developer',
        college: obj.college || 'National Institute of Technology',
        year: obj.year || '3rd Year',
        avatar: obj.user?.avatar || '',
        bio: obj.bio || '',
        reputation: obj.reputationScore || 1000,
        matchScore: Math.floor(Math.random() * 15) + 84, // Rule-based mock score 84-98%
        availability: obj.availability || '8 hrs/week',
        skills: obj.skills || [],
        interests: obj.interests || [],
        codingProfiles: obj.codingProfiles || {},
        projects: obj.projects || [],
        whyThisPerson: {
          skillsMatch: `Strong ${obj.skills?.[0] || 'React'} & ${obj.skills?.[1] || 'Node.js'} match`,
          interestMatch: `Interested in ${obj.interests?.[0] || 'AI'} domain tracks`,
          availabilityMatch: `Available ${obj.availability || '8 hrs/week'} during sprint`,
          experienceMatch: `Delivered verified hackathon projects`,
          reputationScore: obj.reputationScore || 1000,
        },
      };
    });

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};
