import { api } from './api';
import { participants } from '../data/users';

export const mockProfileService = {
  getCandidates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.specialization && filters.specialization !== 'All') params.append('specialization', filters.specialization);
      if (filters.skill && filters.skill !== 'All') params.append('skill', filters.skill);
      if (filters.interest && filters.interest !== 'All') params.append('interest', filters.interest);
      if (filters.searchQuery && filters.searchQuery.trim()) params.append('query', filters.searchQuery.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/profiles${queryStr}`);
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }

    let list = participants;
    if (filters.specialization && filters.specialization !== 'All') {
      list = list.filter((p) => p.specialization.toLowerCase().includes(filters.specialization.toLowerCase()));
    }
    if (filters.skill && filters.skill !== 'All') {
      list = list.filter((p) => p.skills.some((s) => s.toLowerCase() === filters.skill.toLowerCase()));
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialization.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getCandidateById: async (id) => {
    try {
      const res = await api.get(`/profile/${id}`);
      if (res.success && res.data) {
        const p = res.data;
        return {
          id: p.user?._id || p._id,
          name: p.user?.name || 'Developer',
          specialization: p.specialization || 'Developer',
          college: p.college || 'National Institute of Technology',
          year: p.year || '3rd Year',
          bio: p.bio || '',
          reputation: p.reputationScore || 1100,
          availability: p.availability || '8 hrs/week',
          skills: p.skills || [],
          interests: p.interests || [],
          codingProfiles: p.codingProfiles || {},
          projects: p.projects || [],
          whyThisPerson: {
            skillsMatch: `Strong ${p.skills?.[0] || 'Full Stack'} experience`,
            interestMatch: `Interested in ${p.interests?.[0] || 'AI'} challenges`,
            availabilityMatch: `Available ${p.availability || '8 hrs/week'}`,
            experienceMatch: `Verified hackathon participant`,
            reputationScore: p.reputationScore || 1100,
          },
        };
      }
    } catch (e) {
      // Fallback
    }
    return participants.find((p) => p.id === id) || participants[0];
  },
};
