import { Team, Membership, Event, Submission } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const requireTeamMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) {
      throw new AppError('VALIDATION_ERROR', 'teamId parameter is required', 400);
    }

    // Admins and Organizers can inspect team workspaces
    if (['ADMIN', 'ORGANIZER'].includes(req.user.role)) {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
      }
      req.team = team;
      return next();
    }

    const membership = await Membership.findOne({
      userId: req.user._id,
      teamId,
      status: 'active',
    });

    if (!membership) {
      throw new AppError('FORBIDDEN', 'Access denied: You are not an active member of this team', 403);
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
    }

    req.team = team;
    req.membership = membership;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireCaptain = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) {
      throw new AppError('VALIDATION_ERROR', 'teamId parameter is required', 400);
    }

    // Check if membership was already resolved
    let membership = req.membership;
    if (!membership || membership.teamId.toString() !== teamId.toString()) {
      membership = await Membership.findOne({
        userId: req.user._id,
        teamId,
        status: 'active',
      });
    }

    if (!membership || membership.role !== 'captain') {
      // Also check if user is team creator
      const team = req.team || (await Team.findById(teamId));
      if (!team || team.createdBy.toString() !== req.user._id.toString()) {
        throw new AppError('FORBIDDEN', 'Access denied: Only team captain can perform this operation', 403);
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireOrganizerForEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'ORGANIZER') {
      throw new AppError('FORBIDDEN', 'Access denied: Organizer role required', 403);
    }

    const eventId = req.params.eventId || req.body.eventId;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
      }

      if (event.organizerId.toString() !== req.user._id.toString()) {
        throw new AppError('FORBIDDEN', 'Access denied: You are not the designated organizer for this event', 403);
      }
      req.event = event;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireJudgeAssignment = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'JUDGE') {
      throw new AppError('FORBIDDEN', 'Access denied: Judge role required', 403);
    }

    const submissionId = req.params.submissionId || req.body.submissionId;
    if (submissionId) {
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        throw new AppError('RESOURCE_NOT_FOUND', 'Submission not found', 404);
      }

      // Check conflict of interest: Judge must NOT be an active member of the evaluated team
      const conflict = await Membership.findOne({
        userId: req.user._id,
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

      req.submission = submission;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireMentorAssignment = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'MENTOR') {
      throw new AppError('FORBIDDEN', 'Access denied: Mentor role required', 403);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default {
  requireTeamMembership,
  requireCaptain,
  requireOrganizerForEvent,
  requireJudgeAssignment,
  requireMentorAssignment,
};
