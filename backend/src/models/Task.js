import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      default: 'Unassigned',
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    deadline: {
      type: String,
      default: 'Soon',
    },
    tag: {
      type: String,
      default: 'General',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model('Task', taskSchema);
