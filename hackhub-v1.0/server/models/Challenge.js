import mongoose from 'mongoose';

export const CHALLENGE_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const challengeSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      minlength: [3, 'Challenge title must be at least 3 characters'],
      maxlength: [200, 'Challenge title cannot exceed 200 characters'],
    },
    track: {
      type: String,
      required: [true, 'Challenge track is required'],
      trim: true,
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: CHALLENGE_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'intermediate',
    },
    requirements: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    technologies: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    recommendedSkills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: hackathonId pointing to eventId
challengeSchema.virtual('hackathonId')
  .get(function () { return this.eventId; })
  .set(function (val) { this.eventId = val; });

// Indexes
challengeSchema.index({ eventId: 1, category: 1 });
challengeSchema.index({ eventId: 1, title: 1 });

export const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);
export default Challenge;
