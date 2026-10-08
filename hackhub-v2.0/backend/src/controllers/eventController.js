import { Event } from '../models/Event.js';

// GET /api/events
export const getEvents = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.$or = [
        { category: new RegExp(category, 'i') },
        { tags: { $in: [new RegExp(category, 'i')] } },
      ];
    }

    if (search && search.trim()) {
      const q = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: q }, { description: q }, { tags: { $in: [q] } }];
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Hackathon event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null,
    });
    res.status(201).json({ success: true, message: 'Hackathon created successfully', data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/challenges
export const addChallenge = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    event.challenges.push(req.body);
    await event.save();
    res.status(201).json({ success: true, message: 'Challenge added to hackathon', data: event });
  } catch (error) {
    next(error);
  }
};
