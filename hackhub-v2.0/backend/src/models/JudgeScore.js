import mongoose from 'mongoose';

const judgeScoreSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    teamName: { type: String, required: true },
    judgeName: { type: String, default: 'Industry Judge' },
    innovation: { type: Number, required: true, min: 0, max: 25 },
    technical: { type: Number, required: true, min: 0, max: 30 },
    ux: { type: Number, required: true, min: 0, max: 20 },
    impact: { type: Number, required: true, min: 0, max: 25 },
    totalScore: { type: Number, required: true },
    remarks: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const JudgeScore = mongoose.model('JudgeScore', judgeScoreSchema);
