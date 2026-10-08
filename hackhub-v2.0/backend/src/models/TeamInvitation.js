import mongoose from 'mongoose';

const teamInvitationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: { type: String, required: true },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverName: { type: String, required: true },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    teamName: { type: String, default: 'Team Nova' },
    message: { type: String, default: 'Hey! Would love to invite you to our squad.' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

export const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
