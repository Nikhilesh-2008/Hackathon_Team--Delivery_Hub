import { api } from './api';

const presentCandidate = (profile) => ({
  ...profile,
  id: profile?.id || profile?._id || profile?.userId?._id,
  name: profile?.name || profile?.userId?.name || 'HackHub member',
  college: profile?.college || profile?.userId?.college || '',
  year: profile?.year || profile?.userId?.graduationYear || '',
  specialization: profile?.specialization || profile?.role || 'Generalist',
  reputation: profile?.reputation || profile?.reputationScore || 0,
  whyThisPerson: profile?.whyThisPerson || {
    skillsMatch: profile?.skills?.length ? `Skills: ${profile.skills.slice(0, 3).join(', ')}` : 'Complementary skill set',
    interestMatch: profile?.interests?.[0] || 'Open to hackathon challenges',
    availabilityMatch: profile?.availability || 'Availability not specified',
    experienceMatch: profile?.experienceLevel || 'HackHub participant',
  },
});

export const mockProfileService = {
  getCandidates: async (filters = {}) => {
    const response = await api.post('/discovery/teammates', {
      specialization: filters.specialization || 'All',
      skill: filters.skill || 'All',
      interest: filters.interest || 'All',
      query: filters.searchQuery || filters.query || '',
      limit: 20,
    });
    return (response.data || []).map(presentCandidate);
  },

  getCandidateById: async (id) => {
    const response = await api.post('/discovery/teammates', { limit: 100 });
    const candidate = (response.data || []).find((profile) => String(profile.id || profile._id) === String(id));
    if (!candidate) throw new Error('This profile is unavailable or is not discoverable.');
    return presentCandidate(candidate);
  },

  getMyProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  updateMyProfile: async (profile) => {
    const response = await api.patch('/profiles/me', profile);
    return response.data;
  },
};
