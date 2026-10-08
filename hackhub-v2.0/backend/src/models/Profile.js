import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: 'Full Stack Developer',
    },
    college: {
      type: String,
      default: 'National Institute of Technology',
    },
    year: {
      type: String,
      default: '3rd Year, B.Tech CSE',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      default: '8-10 hours/week',
    },
    codingProfiles: {
      github: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      codechef: { type: String, default: '' },
      codeforces: { type: String, default: '' },
    },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        techStack: { type: [String], default: [] },
        githubUrl: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
      },
    ],
    certificates: [
      {
        title: { type: String, required: true },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' },
      },
    ],
    reputationScore: {
      type: Number,
      default: 100,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model('Profile', profileSchema);
