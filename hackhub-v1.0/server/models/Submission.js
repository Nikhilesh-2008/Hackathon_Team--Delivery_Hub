import mongoose from 'mongoose';
import { isValidRepoUrl, isValidUrl } from '../validators/common.js';

export const SUBMISSION_STATUSES = ['draft', 'submitted', 'locked'];

const evidenceSchema = new mongoose.Schema(
  {
    criterionId: {
      type: String,
      required: [true, 'Criterion ID reference is required'],
    },
    type: {
      type: String,
      enum: ['githubRepo', 'deploymentLink', 'demoVideo', 'presentationDeck', 'documentation'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: [isValidUrl, 'Invalid evidence URL'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      unique: true,
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge reference is required'],
      index: true,
    },
    rubricVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [10, 'Project description must be at least 10 characters'],
      maxlength: [4000, 'Project description cannot exceed 4000 characters'],
    },
    repositoryUrl: {
      type: String,
      required: [true, 'GitHub / Repository URL is required'],
      trim: true,
      validate: [isValidRepoUrl, 'Repository URL must be a valid public Git host (e.g. GitHub, GitLab)'],
    },
    deploymentUrl: {
      type: String,
      required: [true, 'Working deployment URL is required'],
      trim: true,
      validate: [isValidUrl, 'Working deployment URL must be a valid URL (http/https)'],
    },
    demoVideoUrl: {
      type: String,
      trim: true,
      default: '',
      validate: [isValidUrl, 'Demo video URL must be a valid URL'],
    },
    presentationUrl: {
      type: String,
      trim: true,
      default: '',
      validate: [isValidUrl, 'Presentation URL must be a valid URL'],
    },
    evidence: [evidenceSchema],
    checklist: {
      githubRepo: { type: Boolean, default: false },
      deploymentLink: { type: Boolean, default: false },
      projectDescription: { type: Boolean, default: false },
      presentationDeck: { type: Boolean, default: false },
      demoVideo: { type: Boolean, default: false },
      finalTesting: { type: Boolean, default: false },
    },
    readinessPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: SUBMISSION_STATUSES,
        message: '{VALUE} is not a valid submission status',
      },
      default: 'draft',
      index: true,
    },
    revision: {
      type: Number,
      required: true,
      default: 1,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Derive readiness percentage dynamically before saving/validating
submissionSchema.pre('validate', function () {
  if (this.checklist) {
    const keys = ['githubRepo', 'deploymentLink', 'projectDescription', 'presentationDeck', 'demoVideo', 'finalTesting'];
    const count = keys.reduce((acc, k) => acc + (this.checklist[k] ? 1 : 0), 0);
    this.readinessPercentage = Math.round((count / keys.length) * 100);
  }
});

// Indexes
submissionSchema.index({ teamId: 1 }, { unique: true });
submissionSchema.index({ eventId: 1, status: 1 });
submissionSchema.index({ challengeId: 1, status: 1 });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
export default Submission;
