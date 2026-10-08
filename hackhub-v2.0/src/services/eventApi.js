import { api } from './api';

export const eventApi = {
  getEvents: async (category = 'All', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/events${queryStr}`);
  },

  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },

  createEvent: async (eventData) => {
    return await api.post('/events', eventData);
  },

  addChallenge: async (eventId, challengeData) => {
    return await api.post(`/events/${eventId}/challenges`, challengeData);
  },
};
