import eventService from '../services/event.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const listEvents = async (req, res, next) => {
  try {
    const { events, meta } = await eventService.listEvents(req.query, req.user);
    return sendCollection(res, events, meta, 200);
  } catch (err) {
    return next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const data = await eventService.getEventById(req.params.eventId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const data = await eventService.createEvent(req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const data = await eventService.updateEvent(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const publishEvent = async (req, res, next) => {
  try {
    const data = await eventService.publishEvent(req.params.eventId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const lockSubmissions = async (req, res, next) => {
  try {
    const data = await eventService.lockSubmissions(req.params.eventId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const assignStaff = async (req, res, next) => {
  try {
    const data = await eventService.assignStaff(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
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
