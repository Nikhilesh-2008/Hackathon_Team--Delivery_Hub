import { api } from './api';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const presentEvent = (record) => {
  const minTeamSize = record?.minTeamSize ?? 2;
  const maxTeamSize = record?.maxTeamSize ?? 4;
  const rubricCriteria = record?.rubric?.criteria || [];

  return {
    ...record,
    id: record?._id || record?.id,
    title: record?.name || record?.title || '',
    organizer: record?.organizerName || record?.organizer || '',
    category: record?.categories?.[0] || record?.category || '',
    tags: record?.technologies || record?.tags || [],
    status: record?.status ? `${record.status[0].toUpperCase()}${record.status.slice(1)}` : '',
    registrationStatus: record?.registrationStatus || '',
    startDate: formatDate(record?.startDate) || record?.startDate || '',
    endDate: formatDate(record?.endDate) || record?.endDate || '',
    registrationDeadline: formatDate(record?.registrationDeadline) || record?.registrationDeadline || '',
    submissionDeadline: formatDate(record?.submissionDeadline) || record?.submissionDeadline || '',
    minTeamSize,
    maxTeamSize,
    teamSize: `${minTeamSize}-${maxTeamSize} members`,
    challenges: (record?.challenges || []).map((challenge) => ({
      ...challenge,
      id: challenge._id || challenge.id,
      deadline: challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : '',
      teamRequirements: `${minTeamSize}-${maxTeamSize} members`,
    })),
    judgingCriteria: rubricCriteria.map((criterion) => ({
      criteria: criterion.name,
      weight: `${criterion.weightPercentage}%`,
      desc: criterion.description,
    })),
  };
};

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
    const { event, challenges = [], rubric, myRegistration = null, myTeam = null } = response.data || {};
    return {
      ...presentEvent({ ...event, challenges, rubric }),
      rubric,
      myRegistration,
      myTeam,
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
