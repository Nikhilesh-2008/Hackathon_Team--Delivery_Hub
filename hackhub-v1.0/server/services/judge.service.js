import { Score, Submission, Membership, Event, Rubric } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getAssignedSubmissions = async (judgeUser) => {
  // Find submissions submitted or locked for evaluation
  const submissions = await Submission.find({ status: { $in: ['submitted', 'locked'] } })
    .populate('teamId', 'name createdBy')
    .populate('eventId', 'name slug submissionDeadline status')
    .populate('challengeId', 'title track problemStatement')
    .lean();

  // Exclude submissions where judge is a team member (conflict of interest prevention)
  const judgeMemberships = await Membership.find({
    userId: judgeUser._id,
    status: 'active',
  }).select('teamId');

  const memberTeamIds = new Set(judgeMemberships.map((m) => m.teamId.toString()));

  const filtered = submissions.filter((s) => {
    const tid = (s.teamId?._id || s.teamId).toString();
    return !memberTeamIds.has(tid);
  });

  return filtered;
};

export const getSubmissionScores = async (submissionId) => {
  const scores = await Score.find({ submissionId })
    .populate('judgeId', 'name avatarUrl college role')
    .sort({ createdAt: -1 });

  return scores;
};

export const submitScore = async (submissionId, judgeUser, scoreData) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Submission not found', 404);
  }

  // Conflict of Interest Protection: Judge MUST NOT score their own team
  const conflict = await Membership.findOne({
    userId: judgeUser._id,
    teamId: submission.teamId,
    status: 'active',
  });

  if (conflict) {
    throw new AppError(
      'FORBIDDEN',
      'Conflict of Interest: Judges are strictly prohibited from evaluating their own team',
      403
    );
  }

  // Enforce unique evaluation per judge per submission
  const existingScore = await Score.findOne({
    submissionId: submission._id,
    judgeId: judgeUser._id,
  });

  if (existingScore) {
    throw new AppError('CONFLICT', 'Evaluation already recorded for this submission by this judge', 409);
  }

  // Validate criteria scores and compute total score
  const criteriaScores = scoreData.criteriaScores || [];
  if (!Array.isArray(criteriaScores) || criteriaScores.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'At least one criterion score is required', 400);
  }

  const computedTotal = criteriaScores.reduce((sum, c) => sum + (Number(c.score) || 0), 0);
  if (computedTotal > 100 || computedTotal < 0) {
    throw new AppError('VALIDATION_ERROR', `Total score must be between 0 and 100 (got ${computedTotal})`, 400);
  }

  const score = await Score.create({
    eventId: submission.eventId,
    submissionId: submission._id,
    judgeId: judgeUser._id,
    judgeName: judgeUser.name,
    rubricVersion: scoreData.rubricVersion || submission.rubricVersion || 1,
    criteriaScores,
    totalScore: computedTotal,
    comments: scoreData.comments || '',
  });

  return score;
};

export default {
  getAssignedSubmissions,
  getSubmissionScores,
  submitScore,
};
