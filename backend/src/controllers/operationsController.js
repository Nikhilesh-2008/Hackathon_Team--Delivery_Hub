import { Submission } from '../models/Submission.js';
import { MentorFeedback } from '../models/MentorFeedback.js';
import { JudgeScore } from '../models/JudgeScore.js';
import { Reputation } from '../models/Reputation.js';
import { Notification } from '../models/Notification.js';
import { Team } from '../models/Team.js';

const findUserTeam = (userId) => Team.findOne({
  $or: [{ captain: userId }, { 'members.user': userId }],
});

// SUBMISSIONS
export const getSubmission = async (req, res, next) => {
  try {
    const team = await findUserTeam(req.user._id);
    if (!team) return res.status(404).json({ success: false, message: 'Join or create a team before managing a submission' });
    const submission = await Submission.findOne({ team: team._id });
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

export const saveSubmission = async (req, res, next) => {
  try {
    const team = await findUserTeam(req.user._id);
    if (!team) return res.status(404).json({ success: false, message: 'Join or create a team before managing a submission' });
    const submission = await Submission.findOneAndUpdate(
      { team: team._id },
      { $set: { githubUrl: req.body.githubUrl, liveUrl: req.body.liveUrl, demoVideoUrl: req.body.demoVideoUrl, presentationUrl: req.body.presentationUrl, description: req.body.description, checklist: req.body.checklist } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, message: 'Submission draft saved', data: submission });
  } catch (error) {
    next(error);
  }
};

export const submitProject = async (req, res, next) => {
  try {
    const team = await findUserTeam(req.user._id);
    if (!team) return res.status(404).json({ success: false, message: 'Join or create a team before submitting a project' });
    const submission = await Submission.findOneAndUpdate(
      { team: team._id },
      { $set: { status: 'SUBMITTED', submittedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Save a submission draft before submitting' });
    res.status(200).json({ success: true, message: '🎉 Project officially submitted to Hackathon jury!', data: submission });
  } catch (error) {
    next(error);
  }
};

// MENTOR FEEDBACK
export const getMentorFeedback = async (req, res, next) => {
  try {
    const team = await findUserTeam(req.user._id);
    const feedback = await MentorFeedback.find(team ? { team: team._id } : { _id: null }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const createMentorFeedback = async (req, res, next) => {
  try {
    const { teamId, title, comment, rating, mentorName, mentorRole } = req.body;
    if (!teamId || !title || !comment) return res.status(400).json({ success: false, message: 'Team, title, and comment are required' });
    if (!(await Team.exists({ _id: teamId }))) return res.status(404).json({ success: false, message: 'Team not found' });
    const fb = await MentorFeedback.create({
      team: teamId,
      mentorName: req.user.name || mentorName,
      mentorRole: req.user.role,
      title,
      comment,
      rating,
      recommendations: [],
    });

    res.status(201).json({ success: true, message: 'Feedback sent to team sprint board!', data: fb });
  } catch (error) {
    next(error);
  }
};

// JUDGE SCORING
export const submitJudgeScore = async (req, res, next) => {
  try {
    const { submissionId, teamName, innovation, technical, ux, impact, remarks } = req.body;
    const submissionRecord = submissionId ? await Submission.findById(submissionId) : null;
    if (!submissionRecord) return res.status(404).json({ success: false, message: 'Submission not found' });
    const totalScore = Number(innovation) + Number(technical) + Number(ux) + Number(impact);

    const score = await JudgeScore.create({
      submission: submissionRecord._id,
      teamName: teamName || 'Team',
      judgeName: req.user.name,
      innovation,
      technical,
      ux,
      impact,
      totalScore,
      remarks,
    });

    res.status(201).json({ success: true, message: `Evaluation submitted! Total: ${totalScore}/100`, data: score });
  } catch (error) {
    next(error);
  }
};

// REPUTATION
export const getReputationHistory = async (req, res, next) => {
  try {
    const history = await Reputation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// NOTIFICATIONS
export const getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifs });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
