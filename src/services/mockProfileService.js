import { participants } from '../data/users';

const CANDIDATES_STORAGE_KEY = 'hackhub_candidates';

export const mockProfileService = {
  getCandidates: async (filters = {}) => {
    let list = JSON.parse(localStorage.getItem(CANDIDATES_STORAGE_KEY)) || participants;

    if (filters.specialization && filters.specialization !== 'All') {
      list = list.filter((p) => p.specialization.toLowerCase().includes(filters.specialization.toLowerCase()));
    }

    if (filters.skill && filters.skill !== 'All') {
      list = list.filter((p) => p.skills.some((s) => s.toLowerCase() === filters.skill.toLowerCase()));
    }

    if (filters.interest && filters.interest !== 'All') {
      list = list.filter((p) => p.interests.some((i) => i.toLowerCase() === filters.interest.toLowerCase()));
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      // Natural language matching across skills, bio, interests, specialization
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        p.specialization.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.interests.some((i) => i.toLowerCase().includes(q))
      );
    }

    return list;
  },

  getCandidateById: async (id) => {
    const list = JSON.parse(localStorage.getItem(CANDIDATES_STORAGE_KEY)) || participants;
    return list.find((p) => p.id === id) || null;
  }
};
