import mongoose from 'mongoose';

export const INVITATION_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled', 'expired'];
export const INVITATION_ROLES = ['captain', 'member', 'mentor', 'judge'];

const invitationSchema = new mongoose.Schema(
  {
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter user reference is required'],
      index: true,
    },
    inviteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Invitee user reference is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true, // Optional if it's an event staff invitation
    },
    role: {
      type: String,
      enum: {
        values: INVITATION_ROLES,
        message: '{VALUE} is not a valid invitation role',
      },
      default: 'member',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: INVITATION_STATUSES,
        message: '{VALUE} is not a valid invitation status',
      },
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: '',
    },
    tokenHash: {
      type: String,
      select: false, // Never expose token hash
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
invitationSchema.index({ inviteeId: 1, status: 1 });
invitationSchema.index({ teamId: 1, inviteeId: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });

export const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
export default Invitation;
