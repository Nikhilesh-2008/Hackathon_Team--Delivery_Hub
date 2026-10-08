import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  role: { type: String, default: 'Developer' },
  specialization: { type: String, default: 'Developer' },
  isCaptain: { type: Boolean, default: false },
  availability: { type: String, default: '8-10 hrs/week' },
  skills: { type: [String], default: [] },
  taskCount: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    hackathonTitle: { type: String, default: 'NexusHack 2026' },
    challengeTitle: { type: String, default: 'Intelligent Adaptive Study Engine' },
    description: { type: String, default: '' },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    members: [teamMemberSchema],
    technicalDecisions: [
      {
        title: { type: String, required: true },
        author: { type: String, required: true },
        date: { type: String, default: 'Today' },
        status: { type: String, default: 'Approved' },
      },
    ],
    chatMessages: [
      {
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: String, default: 'Just now' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.model('Team', teamSchema);
