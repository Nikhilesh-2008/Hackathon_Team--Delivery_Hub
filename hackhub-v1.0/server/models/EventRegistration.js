import mongoose from 'mongoose';

export const REGISTRATION_STATUSES = ['registered', 'cancelled'];

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
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
    status: {
      type: String,
      required: true,
      enum: {
        values: REGISTRATION_STATUSES,
        message: '{VALUE} is not a valid registration status',
      },
      default: 'registered',
      index: true,
    },
    registeredAt: {
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

// One registration record per participant per hackathon
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRegistrationSchema.index({ eventId: 1, status: 1 });

export const EventRegistration =
  mongoose.models.EventRegistration || mongoose.model('EventRegistration', eventRegistrationSchema);
export default EventRegistration;
