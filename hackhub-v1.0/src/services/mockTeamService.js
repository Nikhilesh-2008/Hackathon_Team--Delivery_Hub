import { api } from './api';

const presentTask = (task) => ({
  ...task,
  id: task?._id || task?.id,
  owner: task?.ownerName || task?.ownerId?.name || 'Unassigned',
  priority: task?.priority ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)}` : 'Medium',
  deadline: task?.targetDate ? new Date(task.targetDate).toLocaleDateString() : '',
  status: ({ todo: 'TODO', in_progress: 'IN_PROGRESS', blocked: 'BLOCKED', done: 'COMPLETED' })[task?.status] || task?.status,
});

const presentSubmission = (submission) => submission ? ({
  ...submission,
  id: submission._id || submission.id,
  githubUrl: submission.repositoryUrl || '',
  liveUrl: submission.deploymentUrl || '',
  status: String(submission.status || 'draft').toUpperCase(),
}) : null;

export const mockTeamService = {
  getCurrentTeam: async () => {
    const me = await api.get('/auth/me');
    const activeTeam = me.data?.activeTeams?.[0];
    if (!activeTeam?.teamId) return null;

    const response = await api.get(`/teams/${activeTeam.teamId}`);
    const { team, members = [] } = response.data || {};
    return {
      ...team,
      id: team?._id || team?.id,
      hackathonTitle: team?.eventId?.name || '',
      challengeTitle: team?.challengeId?.title || '',
      members: members.map((member) => ({
        id: member.user?._id || member.user?.id,
        name: member.user?.name || 'Member',
        role: member.role,
        isCaptain: member.role === 'captain',
        specialization: member.specialization || '',
      })),
    };
  },

  getInvitations: async (teamId) => {
    if (!teamId) return [];
    const response = await api.get(`/teams/${teamId}/invitations`);
    return response.data || [];
  },

  getReceivedInvitations: async () => {
    try {
      const response = await api.get('/invitations/received');
      return response.data || [];
    } catch {
      return [];
    }
  },

  sendInvitation: async (teamId, candidateId, message) => {
    let resolvedTeamId = teamId;
    if (!resolvedTeamId) {
      const eventsRes = await api.get('/events');
      const events = eventsRes.data?.events || eventsRes.data || [];
      const activeEvent = events.find((e) => e.status === 'published' || e.status === 'active') || events[0];
      if (activeEvent) {
        const eventId = activeEvent._id || activeEvent.id;
        let challengeId = null;
        try {
          const detailRes = await api.get(`/events/${eventId}`);
          const challenges = detailRes.data?.challenges || [];
          challengeId = challenges[0]?._id || challenges[0]?.id;
        } catch {}

        const teamRes = await api.post('/teams', {
          eventId,
          challengeId,
          name: `Squad ${Math.floor(100 + Math.random() * 900)}`,
          description: 'Hackathon collaboration squad.',
        });
        resolvedTeamId = teamRes.data?._id || teamRes.data?.id;
      }
    }
    if (!resolvedTeamId) throw new Error('Create or join a team before inviting teammates.');
    const response = await api.post(`/teams/${resolvedTeamId}/invitations`, { inviteeId: candidateId, message });
    return response.data;
  },

  respondInvitation: async (invitationId, accept = true) => {
    const action = accept ? 'accept' : 'reject';
    const response = await api.post(`/invitations/${invitationId}/${action}`, {});
    return response.data;
  },

  getTeam: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },
};

export const mockTaskService = {
  getTasks: async (teamId) => {
    if (!teamId) return [];
    const response = await api.get(`/teams/${teamId}/tasks`);
    return (response.data || []).map(presentTask);
  },

  updateTaskStatus: async (task, newStatus) => {
    const status = ({ TODO: 'todo', IN_PROGRESS: 'in_progress', BLOCKED: 'blocked', COMPLETED: 'done' })[newStatus] || newStatus;
    const response = await api.patch(`/tasks/${task.id || task._id}`, { status, version: task.version });
    return presentTask(response.data);
  },

  addTask: async (teamId, taskData) => {
    if (!teamId) throw new Error('Create or join a team before adding sprint tasks.');
    const response = await api.post(`/teams/${teamId}/tasks`, {
      ...taskData,
      ownerId: taskData.ownerId || undefined,
      ownerName: taskData.ownerName || taskData.owner || undefined,
      priority: String(taskData.priority || 'medium').toLowerCase(),
      targetDate: taskData.targetDate || taskData.deadline || undefined,
    });
    return presentTask(response.data);
  },
};

export const mockSubmissionService = {
  getSubmission: async (teamId) => {
    if (!teamId) return null;
    const response = await api.get(`/teams/${teamId}/submission`);
    return presentSubmission(response.data);
  },

  saveSubmission: async (teamId, data) => {
    if (!teamId) throw new Error('Create or join a team before saving a submission.');
    const response = await api.patch(`/teams/${teamId}/submission`, {
      ...data,
      repositoryUrl: data.repositoryUrl || data.githubUrl || '',
      deploymentUrl: data.deploymentUrl || data.liveUrl || '',
      action: 'SAVE_DRAFT',
    });
    return presentSubmission(response.data);
  },

  submitProject: async (teamId, data, existingSubmission) => {
    if (!teamId) throw new Error('Create or join a team before submitting a project.');
    const draft = await mockSubmissionService.saveSubmission(teamId, data);
    const response = await api.post(`/submissions/${draft.id || existingSubmission?._id}/submit`, {});
    return presentSubmission(response.data);
  },
};
