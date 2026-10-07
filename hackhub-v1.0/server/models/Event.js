import mongoose from 'mongoose';

export const EVENT_STATUSES = ['draft', 'published', 'active', 'closed', 'locked'];
export const EVENT_MODES = ['online', 'in-person', 'hybrid'];

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      minlength: [3, 'Event name must be at least 3 characters'],
      maxlength: [150, 'Event name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Event slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
      index: true,
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    theme: {
      type: String,
      default: '',
      trim: true,
    },
    categories: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    technologies: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    mode: {
      type: String,
      enum: {
        values: EVENT_MODES,
        message: '{VALUE} is not a valid event mode',
      },
      default: 'hybrid',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    prizePool: {
      type: String,
      default: '₹0',
      trim: true,
    },
    minTeamSize: {
      type: Number,
      required: true,
      min: [1, 'Minimum team size must be at least 1'],
      default: 2,
    },
    maxTeamSize: {
      type: Number,
      required: true,
      max: [10, 'Maximum team size cannot exceed 10'],
      default: 4,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    submissionDeadline: {
      type: Date,
      required: [true, 'Official submission deadline is required in MongoDB'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: EVENT_STATUSES,
        message: '{VALUE} is not a valid event status',
      },
      default: 'draft',
      index: true,
    },
    bannerGradient: {
      type: String,
      default: 'from-indigo-600 to-blue-700',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cross-field date validation before saving
eventSchema.pre('validate', function () {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be strictly after start date');
  }
  if (this.minTeamSize && this.maxTeamSize && this.minTeamSize > this.maxTeamSize) {
    this.invalidate('maxTeamSize', 'Maximum team size cannot be smaller than minimum team size');
  }
});

// Indexes
eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ submissionDeadline: 1 });
eventSchema.index({ organizerId: 1 });

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Hackathon = Event; // Export alias for blueprint consistency
export default Event;
