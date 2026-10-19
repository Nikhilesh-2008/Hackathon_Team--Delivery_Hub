import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { mockTeamService, mockTaskService, mockSubmissionService } from '../services/mockTeamService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    if (!user) {
      setCurrentTeam(null);
      setTasks([]);
      setSubmission(null);
      setInvitations([]);
      setReceivedInvitations([]);
      return;
    }

    setIsLoading(true);
    try {
      const [team, received] = await Promise.all([
        mockTeamService.getCurrentTeam(),
        mockTeamService.getReceivedInvitations(),
      ]);
      setCurrentTeam(team);
      setReceivedInvitations(received);

      if (!team?.id) {
        setTasks([]);
        setSubmission(null);
        setInvitations([]);
        return;
      }

      const [teamTasks, teamSubmission, teamInvitations] = await Promise.all([
        mockTaskService.getTasks(team.id),
        mockSubmissionService.getSubmission(team.id),
        mockTeamService.getInvitations(team.id),
      ]);
      setTasks(teamTasks);
      setSubmission(teamSubmission);
      setInvitations(teamInvitations);
    } catch (error) {
      console.error('[TeamContext] Could not load team workspace:', error.message);
      setCurrentTeam(null);
      setTasks([]);
      setSubmission(null);
      setInvitations([]);
      setReceivedInvitations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find((item) => item.id === taskId || item._id === taskId);
    if (!task) throw new Error('Task not found. Refresh the workspace and try again.');
    const updatedTask = await mockTaskService.updateTaskStatus(task, newStatus);
    setTasks((current) => current.map((item) => item.id === taskId || item._id === taskId ? updatedTask : item));
    showSuccess('Task status updated');
    return updatedTask;
  };

  const addTask = async (taskData) => {
    if (!currentTeam?.id) throw new Error('Create or join a team before adding sprint tasks.');
    const task = await mockTaskService.addTask(currentTeam.id, taskData);
    setTasks((current) => [...current, task]);
    showSuccess('New task added to sprint');
    return task;
  };

  const updateSubmission = async (data) => {
    if (!currentTeam?.id) throw new Error('Create or join a team before saving a submission.');
    const updated = await mockSubmissionService.saveSubmission(currentTeam.id, data);
    setSubmission(updated);
    showSuccess('Submission draft saved');
    return updated;
  };

  const submitProject = async (data) => {
    if (!currentTeam?.id) throw new Error('Create or join a team before submitting a project.');
    const finalSubmission = await mockSubmissionService.submitProject(currentTeam.id, data, submission);
    setSubmission(finalSubmission);
    showSuccess('Project officially submitted to the hackathon jury');
    return finalSubmission;
  };

  const sendInvitation = async (candidateId, message) => {
    try {
      const invitation = await mockTeamService.sendInvitation(currentTeam?.id, candidateId, message);
      await loadData();
      showSuccess('Invitation sent successfully');
      return invitation;
    } catch (err) {
      showError(err.message || 'Failed to send invitation');
      throw err;
    }
  };

  const respondInvitation = async (invitationId, accept) => {
    try {
      const result = await mockTeamService.respondInvitation(invitationId, accept);
      await loadData();
      showSuccess(accept ? 'Invitation accepted! You joined the squad.' : 'Invitation declined');
      return result;
    } catch (err) {
      showError(err.message || 'Failed to respond to invitation');
      throw err;
    }
  };

  const createTeam = async (teamData) => {
    try {
      const response = await api.post('/teams', teamData);
      await loadData();
      showSuccess(`Team "${teamData.name}" created successfully!`);
      return response.data;
    } catch (err) {
      showError(err.message || 'Failed to create team');
      throw err;
    }
  };

  return (
    <TeamContext.Provider value={{
      currentTeam, tasks, submission, invitations, receivedInvitations, isLoading,
      updateTaskStatus, addTask, updateSubmission, submitProject,
      sendInvitation, respondInvitation, createTeam, reloadTeam: loadData,
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};
