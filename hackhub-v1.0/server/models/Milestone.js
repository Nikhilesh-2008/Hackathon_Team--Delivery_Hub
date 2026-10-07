import mongoose from 'mongoose';

export const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed', 'missed'];

const milestoneSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      minlength: [3, 'Milestone title must be at least 3 characters'],
      maxlength: [150, 'Milestone title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: MILESTONE_STATUSES,
        message: '{VALUE} is not a valid milestone status',
      },
      default: 'pending',
      index: true,
    },
    completionPercentage: {
      type: Number,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
milestoneSchema.index({ teamId: 1, dueDate: 1 });
milestoneSchema.index({ eventId: 1, teamId: 1 });

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
export default Milestone;
