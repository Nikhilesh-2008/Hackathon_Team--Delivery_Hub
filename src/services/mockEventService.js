import { api } from './api';
import { hackathons } from '../data/events';

export const mockEventService = {
  getAllHackathons: async (category = 'All', search = '') => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search && search.trim()) params.append('search', search.trim());
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const res = await api.get(`/events${queryStr}`);
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }

    let list = [...hackathons];
    if (category && category !== 'All') {
      list = list.filter((h) => h.category.toLowerCase() === category.toLowerCase() || h.tags.some((t) => t.toLowerCase() === category.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return list;
  },

  getHackathonById: async (id) => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return hackathons.find((h) => h.id === id || h._id === id) || hackathons[0];
  },

  getChallengeById: async (hackathonId, challengeId) => {
    const event = await mockEventService.getHackathonById(hackathonId);
    if (!event) return null;
    const challenge = event.challenges?.find((c) => c.id === challengeId || c._id === challengeId);
    return challenge ? { ...challenge, hackathonTitle: event.title, hackathonId: event.id || event._id } : null;
  },

  createHackathon: async (eventData) => {
    try {
      const res = await api.post('/events', eventData);
      if (res.success) return res.data;
    } catch (e) {}
    return eventData;
  },
};
