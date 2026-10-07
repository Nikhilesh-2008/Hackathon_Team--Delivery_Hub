import mongoose from 'mongoose';

export const MEMBERSHIP_ROLES = ['captain', 'member'];
export const MEMBERSHIP_STATUSES = ['pending', 'active', 'removed'];

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: MEMBERSHIP_ROLES,
        message: '{VALUE} is not a valid membership role',
      },
      default: 'member',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: MEMBERSHIP_STATUSES,
        message: '{VALUE} is not a valid membership status',
      },
      default: 'active',
      index: true,
    },
    responsibilities: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: hackathonId pointing to eventId
membershipSchema.virtual('hackathonId')
  .get(function () { return this.eventId; })
  .set(function (val) { this.eventId = val; });

// Compound Unique Indexes:
// 1. A user cannot have multiple membership records in the same team
membershipSchema.index({ userId: 1, teamId: 1 }, { unique: true });

// 2. A user can only be an active member of ONE team per event
// Using partial filter expression so removed or pending memberships don't block
membershipSchema.index(
  { userId: 1, eventId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'active' } 
  }
);

membershipSchema.index({ teamId: 1, status: 1 });
membershipSchema.index({ userId: 1, status: 1 });

export const Membership = mongoose.models.Membership || mongoose.model('Membership', membershipSchema);
export default Membership;
