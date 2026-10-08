import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { type: String, default: 'general' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, default: 'Just now' },
    read: { type: Boolean, default: false },
    link: { type: String, default: '/dashboard' },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
