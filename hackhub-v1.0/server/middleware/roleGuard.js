import { AppError } from '../utils/response.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    }

    // ADMIN has universal administrative access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Access denied: requires one of the following roles: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    return next();
  };
};

export const requireOrganizer = requireRole('ORGANIZER', 'ADMIN');
export const requireJudge = requireRole('JUDGE', 'ADMIN');
export const requireMentor = requireRole('MENTOR', 'ADMIN');
export const requireParticipant = requireRole('PARTICIPANT', 'ADMIN');

export default {
  requireRole,
  requireOrganizer,
  requireJudge,
  requireMentor,
  requireParticipant,
};
