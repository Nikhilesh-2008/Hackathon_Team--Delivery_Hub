import { hackathons } from '../data/events';

export const mockEventService = {
  getAllHackathons: async (filter = 'All', searchQuery = '') => {
    let list = [...hackathons];
    if (filter && filter !== 'All') {
      list = list.filter((h) => h.category.toLowerCase() === filter.toLowerCase() || h.tags.some(t => t.toLowerCase() === filter.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((h) => 
        h.title.toLowerCase().includes(q) || 
        h.description.toLowerCase().includes(q) ||
        h.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getHackathonById: async (id) => {
    return hackathons.find((h) => h.id === id) || null;
  },

  getChallengeById: async (hackathonId, challengeId) => {
    const event = hackathons.find((h) => h.id === hackathonId);
    if (!event) return null;
    const challenge = event.challenges.find((c) => c.id === challengeId);
    return challenge ? { ...challenge, hackathonTitle: event.title, hackathonId: event.id } : null;
  }
};
