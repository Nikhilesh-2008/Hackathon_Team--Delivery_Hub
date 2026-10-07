import mongoose from 'mongoose';

export const TEAM_STATUSES = ['forming', 'active', 'submitted', 'disqualified', 'archived'];

const technicalDecisionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Proposed', 'In Discussion', 'Approved', 'Rejected'],
      default: 'Approved',
    },
  },
  { _id: true }
);

const teamSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [80, 'Team name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: TEAM_STATUSES,
        message: '{VALUE} is not a valid team status',
      },
      default: 'forming',
      index: true,
    },
    technicalDecisions: [technicalDecisionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: hackathonId pointing to eventId
teamSchema.virtual('hackathonId')
  .get(function () { return this.eventId; })
  .set(function (val) { this.eventId = val; });

// Indexes
// Team name must be unique within a hackathon event
teamSchema.index({ eventId: 1, name: 1 }, { unique: true });
teamSchema.index({ eventId: 1, challengeId: 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ status: 1 });

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
