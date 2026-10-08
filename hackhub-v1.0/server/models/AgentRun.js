import mongoose from 'mongoose';

export const AGENT_RUN_STATUSES = ['pending', 'analyzing', 'proposed', 'approved', 'rejected', 'failed'];

const agentScheduleItemSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    task: { type: String, required: true },
  },
  { _id: false }
);

const agentProposalSchema = new mongoose.Schema(
  {
    canFinishBeforeDeadline: { type: Boolean, default: true },
    confidencePercentage: { type: Number, min: 0, max: 100, default: 85 },
    assessment: { type: String, default: '' },
    criticalBlocker: { type: String, default: '' },
    recommendations: [{ type: String }],
    proposedSchedule: [agentScheduleItemSchema],
  },
  { _id: false }
);

const agentRunSchema = new mongoose.Schema(
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
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester reference is required'],
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Agent question or prompt is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: AGENT_RUN_STATUSES,
        message: '{VALUE} is not a valid agent run status',
      },
      default: 'proposed',
      index: true,
    },
    toolsUsed: {
      type: [{ type: String }],
      default: [],
    },
    proposal: {
      type: agentProposalSchema,
      default: () => ({}),
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
agentRunSchema.index({ teamId: 1, createdAt: -1 });
agentRunSchema.index({ eventId: 1, status: 1 });

export const AgentRun = mongoose.models.AgentRun || mongoose.model('AgentRun', agentRunSchema);
export default AgentRun;
