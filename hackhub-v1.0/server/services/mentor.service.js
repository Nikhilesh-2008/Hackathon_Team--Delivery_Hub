import { Feedback, Team, Membership, Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getAssignedTeams = async (user) => {
  // Mentors find teams in active events
  const teams = await Team.find({ status: { $in: ['forming', 'active', 'submitted'] } })
    .populate('eventId', 'name slug status submissionDeadline')
    .populate('challengeId', 'title track')
    .populate('createdBy', 'name email avatarUrl');

  return teams;
};

export const getTeamFeedback = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const feedbackList = await Feedback.find({ teamId })
    .populate('mentorId', 'name avatarUrl college')
    .sort({ createdAt: -1 });

  return feedbackList;
};

export const createFeedback = async (teamId, user, feedbackData) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Only mentors can submit guidance feedback', 403);
  }

  const feedback = await Feedback.create({
    eventId: team.eventId,
    teamId: team._id,
    mentorId: user._id,
    mentorName: user.name,
    mentorRole: user.college ? `Faculty Mentor (${user.college})` : 'Mentor',
    title: feedbackData.title,
    message: feedbackData.message,
    rating: feedbackData.rating || 5,
    blocker: feedbackData.blocker || '',
    recommendations: feedbackData.recommendations || [],
  });

  // Notify team members
  const members = await Membership.find({ teamId: team._id, status: 'active' });
  for (const m of members) {
    await Notification.create({
      userId: m.userId,
      type: 'feedback',
      title: 'New Mentor Feedback Received',
      message: `${user.name} shared feedback: "${feedbackData.title}"`,
      relatedEntity: 'Feedback',
      relatedEntityId: feedback._id,
    });
  }

  return feedback;
};

export default {
  getAssignedTeams,
  getTeamFeedback,
  createFeedback,
};
