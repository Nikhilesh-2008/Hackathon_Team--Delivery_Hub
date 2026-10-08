import { api } from './api';

export const teamApi = {
  getMyTeam: async () => {
    return await api.get('/teams/my-team');
  },

  getAllTeams: async () => {
    return await api.get('/teams');
  },

  createTeam: async (teamData) => {
    return await api.post('/teams', teamData);
  },

  sendInvitation: async (receiverId, message, receiverName = 'Peer Developer') => {
    return await api.post('/teams/invitations', {
      receiverId,
      receiverName,
      message,
    });
  },

  getInvitations: async () => {
    return await api.get('/teams/invitations');
  },

  respondInvitation: async (invitationId, accept = true) => {
    return await api.patch(`/teams/invitations/${invitationId}`, {
      status: accept ? 'ACCEPTED' : 'REJECTED',
    });
  },
};
