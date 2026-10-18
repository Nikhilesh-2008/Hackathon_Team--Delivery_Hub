import { api } from './api';

const presentEvent = (record) => ({
  ...record,
  id: record?._id || record?.id,
  title: record?.name || record?.title || '',
  organizer: record?.organizerName || record?.organizer || '',
  category: record?.categories?.[0] || record?.category || '',
  tags: record?.technologies || record?.tags || [],
  registrationStatus: record?.registrationStatus || record?.status || '',
  challenges: (record?.challenges || []).map((challenge) => ({
    ...challenge,
    id: challenge._id || challenge.id,
    deadline: challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : '',
  })),
});

export const mockEventService = {
  getAllHackathons: async (category = 'All', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search?.trim()) params.set('search', search.trim());
    const query = params.size ? `?${params.toString()}` : '';
    const response = await api.get(`/events${query}`);
    return (response.data || []).map(presentEvent);
  },

  getHackathonById: async (id) => {
    const response = await api.get(`/events/${encodeURIComponent(id)}`);
    const { event, challenges = [], rubric } = response.data || {};
    return {
      ...presentEvent({ ...event, challenges }),
      rubric,
    };
  },

  getChallengeById: async (eventId, challengeId) => {
    const response = await api.get(`/events/${encodeURIComponent(eventId)}/challenges/${encodeURIComponent(challengeId)}`);
    return response.data;
  },

  createHackathon: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
};
