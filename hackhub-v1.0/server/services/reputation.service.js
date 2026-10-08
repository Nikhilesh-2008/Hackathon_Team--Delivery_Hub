import mongoose from 'mongoose';
import { Reputation, User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getMyReputation = async (user) => {
  return getUserReputation(user._id);
};

export const getUserReputation = async (userId) => {
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new AppError('RESOURCE_NOT_FOUND', 'User not found', 404);
  }

  const uId = new mongoose.Types.ObjectId(userId);

  // Derive aggregate total from immutable reputation ledger
  const aggregateResult = await Reputation.aggregate([
    { $match: { userId: uId } },
    { $group: { _id: null, totalPoints: { $sum: '$points' } } },
  ]);

  const totalPoints = aggregateResult.length > 0 ? aggregateResult[0].totalPoints : 0;
  const history = await Reputation.find({ userId: uId })
    .populate('eventId', 'name')
    .sort({ createdAt: -1 });

  return {
    userId: targetUser._id,
    userName: targetUser.name,
    totalPoints,
    history,
  };
};

export default {
  getMyReputation,
  getUserReputation,
};
