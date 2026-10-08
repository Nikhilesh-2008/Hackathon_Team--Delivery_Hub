import mongoose from 'mongoose';

const criterionSchema = new mongoose.Schema(
  {
    criterionId: {
      type: String,
      required: [true, 'Criterion ID is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Criterion name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Criterion description is required'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [1, 'Maximum score must be at least 1'],
    },
    weightPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    requiredEvidence: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const rubricSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    criteria: {
      type: [criterionSchema],
      required: true,
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        'Rubric must contain at least one criterion',
      ],
    },
    totalMaxScore: {
      type: Number,
      required: true,
      default: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique version per event
rubricSchema.index({ eventId: 1, version: 1 }, { unique: true });
rubricSchema.index({ eventId: 1, isActive: 1 });

export const Rubric = mongoose.models.Rubric || mongoose.model('Rubric', rubricSchema);
export default Rubric;
