import { Submission } from '../models/Submission.js';
import { MentorFeedback } from '../models/MentorFeedback.js';
import { JudgeScore } from '../models/JudgeScore.js';
import { Reputation } from '../models/Reputation.js';
import { Notification } from '../models/Notification.js';

// SUBMISSIONS
export const getSubmission = async (req, res, next) => {
  try {
    let submission = await Submission.findOne();
    if (!submission) {
      submission = await Submission.create({
        team: '660000000000000000000002',
        githubUrl: 'https://github.com/karthik-dev/ai-study-planner',
        liveUrl: 'https://study-planner-demo.vercel.app',
        description: 'Intelligent adaptive syllabus roadmap and automated quiz diagnostic platform.',
        checklist: {
          githubRepo: true,
          deploymentLink: true,
          projectDescription: true,
          presentationDeck: true,
          demoVideo: false,
          finalTesting: false,
        },
      });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

export const saveSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Submission draft saved', data: submission });
  } catch (error) {
    next(error);
  }
};

export const submitProject = async (req, res, next) => {
  try {
    const submission = await Submission.findOneAndUpdate(
      {},
      { $set: { ...req.body, status: 'SUBMITTED', submittedAt: new Date() } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: '🎉 Project officially submitted to Hackathon jury!', data: submission });
  } catch (error) {
    next(error);
  }
};

// MENTOR FEEDBACK
export const getMentorFeedback = async (req, res, next) => {
  try {
    const feedback = await MentorFeedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const createMentorFeedback = async (req, res, next) => {
  try {
    const { teamId, title, comment, rating, mentorName, mentorRole } = req.body;
    const fb = await MentorFeedback.create({
      team: teamId || '660000000000000000000002',
      mentorName: mentorName || 'Dr. Arvind Rao',
      mentorRole: mentorRole || 'Faculty Mentor · AI & Distributed Systems',
      title,
      comment,
      rating: rating || 4.5,
      recommendations: ['Review API response times', 'Ensure code reproducibility'],
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
    const totalScore = Number(innovation) + Number(technical) + Number(ux) + Number(impact);

    const score = await JudgeScore.create({
      submission: submissionId || '660000000000000000000003',
      teamName: teamName || 'Team Nova',
      judgeName: req.user ? req.user.name : 'Senior Industry Judge',
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
    const history = await Reputation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// NOTIFICATIONS
export const getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifs });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({}, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
