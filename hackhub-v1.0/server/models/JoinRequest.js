import mongoose from 'mongoose';

export const JOIN_REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

const joinRequestSchema = new mongoose.Schema(
  {
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
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: JOIN_REQUEST_STATUSES,
        message: '{VALUE} is not a valid join request status',
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate pending requests from the same user to the same team
joinRequestSchema.index(
  { teamId: 1, requesterId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' } 
  }
);

joinRequestSchema.index({ eventId: 1, status: 1 });
joinRequestSchema.index({ requesterId: 1, status: 1 });

export const JoinRequest = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
