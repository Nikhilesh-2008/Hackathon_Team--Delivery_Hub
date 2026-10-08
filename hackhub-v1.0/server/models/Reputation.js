import mongoose from 'mongoose';

export const REPUTATION_TYPES = [
  'PLACEMENT',
  'PARTICIPATION',
  'TASK_COMPLETION',
  'PEER_REVIEW',
  'MENTOR_BONUS',
  'PENALTY',
];

const reputationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      index: true, // Can be null for platform-wide achievements
    },
    points: {
      type: Number,
      required: [true, 'Points delta is required'],
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: REPUTATION_TYPES,
        message: '{VALUE} is not a valid reputation type',
      },
    },
    reason: {
      type: String,
      required: [true, 'Reason for reputation delta is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Immutable audit trail
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for calculating and displaying user history
reputationSchema.index({ userId: 1, createdAt: -1 });
reputationSchema.index({ userId: 1, eventId: 1 });

export const Reputation = mongoose.models.Reputation || mongoose.model('Reputation', reputationSchema);
export default Reputation;
