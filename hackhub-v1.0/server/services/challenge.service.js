import { Challenge, Event } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const listChallenges = async (eventId) => {
  const challenges = await Challenge.find({ eventId });
  return challenges;
};

export const getChallengeById = async (eventId, challengeId) => {
  const query = { _id: challengeId };
  if (eventId) {
    query.eventId = eventId;
  }

  const challenge = await Challenge.findOne(query);
  if (!challenge) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Challenge track not found', 404);
  }

  return challenge;
};

export const createChallenge = async (eventId, user, data) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can add challenges', 403);
  }

  const challenge = await Challenge.create({
    ...data,
    eventId: event._id,
  });

  return challenge;
};

export const updateChallenge = async (challengeId, user, data) => {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Challenge not found', 404);
  }

  const event = await Event.findById(challenge.eventId);
  if (event && user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can modify challenges', 403);
  }

  Object.assign(challenge, data);
  await challenge.save();

  return challenge;
};

export default {
  listChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
};
