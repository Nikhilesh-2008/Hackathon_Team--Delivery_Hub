import mongoose from 'mongoose';

const mentorFeedbackSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    mentorName: { type: String, required: true },
    mentorRole: { type: String, default: 'Faculty Mentor' },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    recommendations: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const MentorFeedback = mongoose.model('MentorFeedback', mentorFeedbackSchema);
