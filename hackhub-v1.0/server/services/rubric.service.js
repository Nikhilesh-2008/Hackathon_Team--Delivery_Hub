import { Rubric, Event } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getEventRubric = async (eventId) => {
  const rubric = await Rubric.findOne({ eventId, isActive: true }).sort({ version: -1 });
  if (!rubric) {
    // Check if any version exists
    const anyRubric = await Rubric.findOne({ eventId }).sort({ version: -1 });
    return anyRubric;
  }
  return rubric;
};

export const getRubricById = async (rubricId) => {
  const rubric = await Rubric.findById(rubricId);
  if (!rubric) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Scoring rubric not found', 404);
  }
  return rubric;
};

export const createRubric = async (eventId, user, rubricData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can create scoring rubrics', 403);
  }

  // Get highest version
  const latest = await Rubric.findOne({ eventId }).sort({ version: -1 });
  const nextVersion = latest ? latest.version + 1 : 1;

  // Deactivate previous active rubrics
  await Rubric.updateMany({ eventId }, { isActive: false });

  const rubric = await Rubric.create({
    ...rubricData,
    eventId: event._id,
    version: nextVersion,
    createdBy: user._id,
    isActive: true,
  });

  return rubric;
};

export const updateRubric = async (rubricId, user, updateData) => {
  const rubric = await Rubric.findById(rubricId);
  if (!rubric) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Rubric not found', 404);
  }

  const event = await Event.findById(rubric.eventId);
  if (event && user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can update rubrics', 403);
  }

  Object.assign(rubric, updateData);
  await rubric.save();

  return rubric;
};

export default {
  getEventRubric,
  getRubricById,
  createRubric,
  updateRubric,
};
