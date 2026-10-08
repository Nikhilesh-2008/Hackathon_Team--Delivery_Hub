import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
    },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    demoVideoUrl: { type: String, default: '' },
    presentationUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    checklist: {
      githubRepo: { type: Boolean, default: false },
      deploymentLink: { type: Boolean, default: false },
      projectDescription: { type: Boolean, default: false },
      presentationDeck: { type: Boolean, default: false },
      demoVideo: { type: Boolean, default: false },
      finalTesting: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED'],
      default: 'DRAFT',
    },
    submittedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model('Submission', submissionSchema);
