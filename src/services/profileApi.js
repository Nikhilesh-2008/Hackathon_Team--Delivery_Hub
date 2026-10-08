import { api } from './api';

export const profileApi = {
  getMyProfile: async () => {
    return await api.get('/profile/me');
  },

  updateMyProfile: async (profileData) => {
    return await api.put('/profile/me', profileData);
  },

  getProfileById: async (id) => {
    return await api.get(`/profile/${id}`);
  },

  searchProfiles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.specialization && filters.specialization !== 'All') params.append('specialization', filters.specialization);
    if (filters.skill && filters.skill !== 'All') params.append('skill', filters.skill);
    if (filters.interest && filters.interest !== 'All') params.append('interest', filters.interest);
    if (filters.query && filters.query.trim()) params.append('query', filters.query.trim());

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/profiles${queryStr}`);
  },
};
