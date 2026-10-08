import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hackhub_super_secret_jwt_key_2026_dev_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hash) => {
  if (!hash || !password) return false;
  return bcrypt.compare(password, hash);
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAuthToken = (user, sessionId = null) => {
  const payload = {
    userId: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    ...(sessionId ? { sessionId: sessionId.toString() } : {}),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export default {
  hashPassword,
  comparePassword,
  hashToken,
  generateAuthToken,
  verifyAuthToken,
  generateRandomToken,
};
