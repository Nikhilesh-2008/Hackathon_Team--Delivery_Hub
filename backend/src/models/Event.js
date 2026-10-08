import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  track: { type: String, default: 'General' },
  problemStatement: { type: String, required: true },
  description: { type: String, default: '' },
  requirements: { type: [String], default: [] },
  recommendedSkills: { type: [String], default: [] },
  teamRequirements: { type: String, default: '2-4 Members' },
  deadline: { type: String, default: '' },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Open Innovation',
    },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Completed'],
      default: 'Active',
    },
    registrationStatus: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    registrationDeadline: { type: String, default: '' },
    submissionDeadline: { type: String, default: '' },
    location: { type: String, default: 'Online' },
    prizePool: { type: String, default: '₹1,00,000' },
    teamSize: { type: String, default: '2 - 4 Members' },
    description: { type: String, required: true },
    rules: [
      {
        section: { type: String, default: '1.0' },
        title: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    judgingCriteria: [
      {
        criteria: { type: String, required: true },
        weight: { type: String, default: '25%' },
        desc: { type: String, default: '' },
      },
    ],
    challenges: [challengeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
