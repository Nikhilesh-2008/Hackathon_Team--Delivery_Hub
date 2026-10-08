import { api } from './api';
import { mockTeams, mockTasks, mockTimeline } from '../data/teams';
import { mockFeedback, mockInvitations } from '../data/reputation';

export const mockTeamService = {
  getCurrentTeam: async () => {
    try {
      const res = await api.get('/teams/my-team');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockTeams[0];
  },

  getAllTeams: async () => {
    try {
      const res = await api.get('/teams');
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockTeams;
  },

  sendInvitation: async (candidateId, message, receiverName = 'Developer') => {
    try {
      const res = await api.post('/teams/invitations', {
        receiverId: candidateId,
        receiverName,
        message,
      });
      if (res.success) return res;
    } catch (e) {
      // Fallback
    }
    return { success: true, message: 'Invitation sent to candidate successfully!' };
  },

  getInvitations: async () => {
    try {
      const res = await api.get('/teams/invitations');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockInvitations;
  },

  respondInvitation: async (invitationId, accept = true) => {
    try {
      const res = await api.patch(`/teams/invitations/${invitationId}`, {
        status: accept ? 'ACCEPTED' : 'REJECTED',
      });
      if (res.success) return res.data;
    } catch (e) {
      // Fallback
    }
    return mockInvitations;
  },

  getMentorFeedback: async () => {
    try {
      const res = await api.get('/feedback');
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockFeedback;
  },

  addMentorFeedback: async (feedback) => {
    try {
      const res = await api.post('/feedback', feedback);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return { id: `fb_${Date.now()}`, timestamp: 'Just now', ...feedback };
  },
};

export const mockTaskService = {
  getTasks: async () => {
    try {
      const res = await api.get('/tasks');
      if (res.success && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return mockTasks;
  },

  updateTaskStatus: async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.success) {
        return await mockTaskService.getTasks();
      }
    } catch (e) {
      // Fallback
    }
    return mockTasks.map((t) => (t.id === taskId || t._id === taskId ? { ...t, status: newStatus } : t));
  },

  addTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      if (res.success) {
        return await mockTaskService.getTasks();
      }
    } catch (e) {
      // Fallback
    }
    return [{ id: `task_${Date.now()}`, status: 'TODO', ...taskData }, ...mockTasks];
  },

  getTimeline: async () => {
    return mockTimeline;
  },
};

export const mockSubmissionService = {
  getSubmission: async () => {
    try {
      const res = await api.get('/submission');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }
    return {
      githubUrl: 'https://github.com/karthik-dev/ai-study-planner',
      liveUrl: 'https://study-planner-demo.vercel.app',
      checklist: { githubRepo: true, deploymentLink: true, projectDescription: true, presentationDeck: true, demoVideo: false, finalTesting: false },
      status: 'DRAFT',
    };
  },

  saveSubmission: async (data) => {
    try {
      const res = await api.put('/submission', data);
      if (res.success && res.data) return res.data;
    } catch (e) {}
    return data;
  },

  submitProject: async (data) => {
    try {
      const res = await api.post('/submission/submit', data);
      if (res.success && res.data) return res.data;
    } catch (e) {}
    return { ...data, status: 'SUBMITTED', submittedAt: new Date().toISOString() };
  },

  submitJudgeScore: async (scoreData) => {
    try {
      const res = await api.post('/scores', scoreData);
      if (res.success) return res;
    } catch (e) {}
    return { success: true };
  },
};
