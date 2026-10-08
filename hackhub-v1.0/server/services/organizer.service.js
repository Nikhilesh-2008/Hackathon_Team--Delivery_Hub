import { Event, Team, Submission, Membership, Challenge, AuditLog } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getOrganizerEvents = async (user) => {
  const query = user.role === 'ADMIN' ? {} : { organizerId: user._id };
  const events = await Event.find(query).sort({ startDate: -1 });
  return events;
};

export const getOrganizerEventDetails = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Access denied: You are not the organizer for this event', 403);
  }

  const [totalTeams, totalSubmissions, totalParticipants, challengesCount, recentAuditLogs] = await Promise.all([
    Team.countDocuments({ eventId: event._id }),
    Submission.countDocuments({ eventId: event._id, status: { $in: ['submitted', 'locked'] } }),
    Membership.countDocuments({ eventId: event._id, status: 'active' }),
    Challenge.countDocuments({ eventId: event._id }),
    AuditLog.find({ eventId: event._id }).sort({ createdAt: -1 }).limit(25),
  ]);

  return {
    event,
    metrics: {
      totalTeams,
      totalSubmissions,
      totalParticipants,
      challengesCount,
    },
    auditTrail: recentAuditLogs,
  };
};

export default {
  getOrganizerEvents,
  getOrganizerEventDetails,
};
