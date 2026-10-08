import { api } from './api';

export const taskApi = {
  getTasks: async (teamId) => {
    const query = teamId ? `?teamId=${teamId}` : '';
    return await api.get(`/tasks${query}`);
  },

  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  updateTaskStatus: async (taskId, status) => {
    return await api.patch(`/tasks/${taskId}/status`, { status });
  },
};
