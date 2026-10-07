import mongoose from 'mongoose';

const criteriaScoreSchema = new mongoose.Schema(
  {
    criterionId: {
      type: String,
      required: true,
      trim: true,
    },
    criterionName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be negative'],
    },
    maxScore: {
      type: Number,
      required: true,
      min: [1, 'Max score must be at least 1'],
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const scoreSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Submission reference is required'],
      index: true,
    },
    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Judge user reference is required'],
      index: true,
    },
    judgeName: {
      type: String,
      required: true,
      trim: true,
    },
    rubricVersion: {
      type: Number,
      required: true,
    },
    criteriaScores: {
      type: [criteriaScoreSchema],
      required: true,
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        'At least one criterion score is required',
      ],
    },
    totalScore: {
      type: Number,
      required: true,
      min: [0, 'Total score cannot be negative'],
      max: [100, 'Total score cannot exceed 100'],
    },
    comments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique index: A judge can score a submission at most once
scoreSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });
scoreSchema.index({ eventId: 1, judgeId: 1 });
scoreSchema.index({ submissionId: 1, totalScore: -1 });

export const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);
export default Score;
