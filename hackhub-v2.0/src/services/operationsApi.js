import { api } from './api';

export const operationsApi = {
  getSubmission: async () => {
    return await api.get('/submission');
  },

  saveSubmissionDraft: async (data) => {
    return await api.put('/submission', data);
  },

  submitProject: async (data) => {
    return await api.post('/submission/submit', data);
  },

  getMentorFeedback: async () => {
    return await api.get('/feedback');
  },

  createMentorFeedback: async (feedbackData) => {
    return await api.post('/feedback', feedbackData);
  },

  submitJudgeScore: async (scoreData) => {
    return await api.post('/scores', scoreData);
  },

  getReputationHistory: async () => {
    return await api.get('/reputation');
  },

  getNotifications: async () => {
    return await api.get('/notifications');
  },

  markNotificationsAsRead: async () => {
    return await api.patch('/notifications/read-all', {});
  },
};
