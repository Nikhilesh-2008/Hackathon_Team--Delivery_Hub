import organizerService from '../services/organizer.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const getOrganizerEvents = async (req, res, next) => {
  try {
    const data = await organizerService.getOrganizerEvents(req.user);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getOrganizerEventDetails = async (req, res, next) => {
  try {
    const data = await organizerService.getOrganizerEventDetails(req.params.eventId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  getOrganizerEvents,
  getOrganizerEventDetails,
};
