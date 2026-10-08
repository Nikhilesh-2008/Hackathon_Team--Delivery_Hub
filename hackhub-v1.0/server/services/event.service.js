import mongoose from 'mongoose';
import { Event, Challenge, Rubric, AuditLog, User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const listEvents = async (query = {}, currentUser = null) => {
  const { category, search, status, page = 1, limit = 20 } = query;
  const filter = {};

  const isStaff = currentUser && ['ORGANIZER', 'ADMIN'].includes(currentUser.role);
  if (isStaff && status) {
    filter.status = status;
  } else {
    // Public discovery must strictly expose only published and active events
    filter.status = { $in: ['published', 'active'] };
  }

  if (category && category !== 'All') {
    filter.categories = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { theme: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  return {
    events,
    meta: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
    },
  };
};

export const getEventById = async (eventId) => {
  let event = null;
  if (mongoose.Types.ObjectId.isValid(eventId)) {
    event = await Event.findById(eventId);
  }
  if (!event) {
    // Try lookup by slug
    event = await Event.findOne({ slug: eventId.toLowerCase() });
  }

  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Hackathon event not found', 404);
  }

  const challenges = await Challenge.find({ eventId: event._id });
  const rubric = await Rubric.findOne({ eventId: event._id, isActive: true });

  return {
    event,
    challenges,
    rubric: rubric || null,
  };
};

export const createEvent = async (user, eventData) => {
  const slug = (eventData.slug || eventData.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existing = await Event.findOne({ slug });
  if (existing) {
    throw new AppError('CONFLICT', `Event with slug '${slug}' already exists`, 409);
  }

  const event = await Event.create({
    ...eventData,
    slug,
    organizerId: user._id,
    organizerName: user.name,
    status: eventData.status || 'draft',
  });

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'EVENT_CREATED',
    entityType: 'Event',
    entityId: event._id,
    reason: 'Initial hackathon creation',
  });

  return event;
};

export const updateEvent = async (eventId, user, updateData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  // Check authorization: organizer or ADMIN
  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only designated event organizer or admin can update event settings', 403);
  }

  Object.assign(event, updateData);
  await event.save();

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'EVENT_UPDATED',
    entityType: 'Event',
    entityId: event._id,
    reason: updateData.reason || 'Event configuration update',
    metadata: updateData,
  });

  return event;
};

export const publishEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can publish event', 403);
  }

  event.status = 'published';
  await event.save();

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'EVENT_PUBLISHED',
    entityType: 'Event',
    entityId: event._id,
    reason: 'Published for public participation and discovery',
  });

  return {
    published: true,
    event,
  };
};

export const lockSubmissions = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can lock submissions', 403);
  }

  event.status = 'locked';
  await event.save();

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'SUBMISSIONS_LOCKED',
    entityType: 'Event',
    entityId: event._id,
    reason: 'Submission window officially closed by organizer',
  });

  return {
    locked: true,
    event,
  };
};

export const assignStaff = async (eventId, user, assignments) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can assign staff', 403);
  }

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'STAFF_ASSIGNED',
    entityType: 'Event',
    entityId: event._id,
    reason: assignments.reason || 'Staff allocation update',
    metadata: assignments,
  });

  return {
    assigned: true,
    eventId: event._id,
    assignments,
  };
};

export default {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  publishEvent,
  lockSubmissions,
  assignStaff,
};
