import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];

const taskSchema = new mongoose.Schema(
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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true, // Can be unassigned initially
    },
    ownerName: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid task priority',
      },
      default: 'medium',
    },
    tag: {
      type: String,
      trim: true,
      default: 'General',
    },
    targetDate: {
      type: Date,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1, // Optimistic concurrency control key
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: hackathonId pointing to eventId
taskSchema.virtual('hackathonId')
  .get(function () { return this.eventId; })
  .set(function (val) { this.eventId = val; });

// Indexes based on actual Kanban and sprint query patterns
taskSchema.index({ teamId: 1, status: 1 });
taskSchema.index({ teamId: 1, ownerId: 1 });
taskSchema.index({ teamId: 1, targetDate: 1 });
taskSchema.index({ eventId: 1, status: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
