import { User, Session } from '../models/index.js';
import { verifyAuthToken, hashToken } from '../utils/auth.js';
import { AppError } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('UNAUTHORIZED', 'Authentication token is missing', 401);
    }

    // Decode and verify JWT
    const decoded = verifyAuthToken(token);
    if (!decoded || !decoded.userId) {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired authentication token', 401);
    }

    // Check database session if sessionId or tokenHash is present
    if (decoded.sessionId) {
      const session = await Session.findById(decoded.sessionId);
      if (!session || !session.isValid || (session.expiresAt && session.expiresAt < new Date())) {
        throw new AppError('UNAUTHORIZED', 'Session expired or invalidated', 401);
      }
      req.session = session;
    } else {
      // Check session by token hash
      const tokenDigest = hashToken(token);
      const session = await Session.findOne({ tokenHash: tokenDigest, isValid: true });
      if (session) {
        if (session.expiresAt && session.expiresAt < new Date()) {
          throw new AppError('UNAUTHORIZED', 'Session has expired', 401);
        }
        req.session = session;
      }
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Authenticated user no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('FORBIDDEN', 'User account is deactivated', 403);
    }

    req.user = user;
    req.auth = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAuthToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.auth = decoded;
        }
      }
    }
    return next();
  } catch {
    return next();
  }
};

export default { requireAuth, optionalAuth };
