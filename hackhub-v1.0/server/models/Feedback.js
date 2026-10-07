import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
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
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor user reference is required'],
      index: true,
    },
    mentorName: {
      type: String,
      required: true,
      trim: true,
    },
    mentorRole: {
      type: String,
      default: 'Faculty Mentor',
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    title: {
      type: String,
      required: [true, 'Feedback title/subject is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
    },
    blocker: {
      type: String,
      default: '',
      trim: true,
    },
    recommendations: {
      type: [{ type: String, trim: true }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
feedbackSchema.index({ teamId: 1, createdAt: -1 });
feedbackSchema.index({ eventId: 1, mentorId: 1 });

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export default Feedback;
