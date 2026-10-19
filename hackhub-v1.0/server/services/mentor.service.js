import { Feedback, Team, Membership, Notification } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getAssignedTeams = async (user) => {
  // Mentors find teams in active events
  const teams = await Team.find({ status: { $in: ['forming', 'active', 'submitted'] } })
    .populate('eventId', 'name slug status submissionDeadline')
    .populate('challengeId', 'title track')
    .populate('createdBy', 'name email avatarUrl')
    .lean();

  const { Task } = await import('../models/index.js');

  const enrichedTeams = await Promise.all(
    teams.map(async (t) => {
      const [memberships, blockerTask] = await Promise.all([
        Membership.find({ teamId: t._id, status: 'active' })
          .populate('userId', 'name email avatarUrl college')
          .lean(),
        Task.findOne({ teamId: t._id, status: 'blocked' }).lean(),
      ]);

      return {
        ...t,
        id: t._id.toString(),
        hackathonTitle: t.eventId?.name || 'Active Hackathon',
        challengeTitle: t.challengeId?.title || t.track || 'General Challenge Track',
        blocker: blockerTask ? blockerTask.title : null,
        members: memberships.map((m) => ({
          id: m.userId?._id?.toString(),
          name: m.userId?.name || 'Teammate',
          email: m.userId?.email,
          college: m.userId?.college,
          role: m.role,
        })),
      };
    })
  );

  return enrichedTeams;
};

export const getMentorFeedback = async (user) => {
  const query = user.role === 'ADMIN' ? {} : { mentorId: user._id };
  const feedbackList = await Feedback.find(query)
    .populate('teamId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return feedbackList.map((fb) => ({
    ...fb,
    id: fb._id.toString(),
    teamName: fb.teamId?.name || 'Assigned Team',
    timestamp: new Date(fb.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
};

export const getTeamFeedback = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const feedbackList = await Feedback.find({ teamId })
    .populate('mentorId', 'name avatarUrl college')
    .sort({ createdAt: -1 })
    .lean();

  return feedbackList.map((fb) => ({
    ...fb,
    id: fb._id.toString(),
    timestamp: new Date(fb.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
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
  getMentorFeedback,
  getTeamFeedback,
  createFeedback,
};
