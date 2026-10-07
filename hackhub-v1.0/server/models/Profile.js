import mongoose from 'mongoose';
import { GITHUB_PROFILE_REGEX } from '../validators/common.js';

export const SPECIALIZATIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'AI/ML Developer',
  'DevOps Developer',
  'Database Developer',
  'Cybersecurity',
  'IoT Developer',
  'Generalist',
];

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String, trim: true }],
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
  },
  { _id: true }
);

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    date: { type: String, trim: true },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    specialization: {
      type: String,
      enum: {
        values: SPECIALIZATIONS,
        message: '{VALUE} is not a valid specialization',
      },
      default: 'Generalist',
      index: true,
    },
    skills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    interests: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: EXPERIENCE_LEVELS,
        message: '{VALUE} is not a valid experience level',
      },
      default: 'intermediate',
    },
    availability: {
      type: String,
      default: '8-10 hrs/week',
      trim: true,
    },
    discoveryConsent: {
      type: Boolean,
      default: true,
      index: true,
    },
    codingProfiles: {
      github: {
        type: String,
        trim: true,
        match: [GITHUB_PROFILE_REGEX, 'Please provide a valid GitHub profile URL'],
      },
      leetcode: { type: String, trim: true },
      codechef: { type: String, trim: true },
      codeforces: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
    projects: [projectSchema],
    certificates: [certificateSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for candidate teammate search queries
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ discoveryConsent: 1, specialization: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ interests: 1 });

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;
