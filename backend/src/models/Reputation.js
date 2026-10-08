import mongoose from 'mongoose';

const reputationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: { type: String, required: true },
    type: { type: String, required: true },
    points: { type: String, required: true },
    date: { type: String, default: 'Recent' },
    description: { type: String, default: '' },
    verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Reputation = mongoose.model('Reputation', reputationSchema);
