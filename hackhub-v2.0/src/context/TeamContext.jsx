import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockTeamService, mockTaskService, mockSubmissionService } from '../services/mockTeamService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const loadData = useCallback(async () => {
    if (!user) {
      setCurrentTeam(null);
      setTasks([]);
      setSubmission(null);
      setInvitations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [t, tsk, sub, inv] = await Promise.all([
        mockTeamService.getCurrentTeam(),
        mockTaskService.getTasks(),
        mockSubmissionService.getSubmission(),
        mockTeamService.getInvitations()
      ]);
      setCurrentTeam(t);
      setTasks(tsk);
      setSubmission(sub);
      setInvitations(inv);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading) loadData();
  }, [isAuthLoading, loadData]);

  const updateTaskStatus = async (taskId, newStatus) => {
    const updated = await mockTaskService.updateTaskStatus(taskId, newStatus);
    setTasks(updated);
    showSuccess("Task status updated");
  };

  const addTask = async (taskData) => {
    const updated = await mockTaskService.addTask(taskData);
    setTasks(updated);
    showSuccess("New task added to sprint");
  };

  const updateSubmission = async (data) => {
    const updated = await mockSubmissionService.saveSubmission(data);
    setSubmission(updated);
    showSuccess("Submission draft saved");
  };

  const submitProject = async (data) => {
    const finalSub = await mockSubmissionService.submitProject(data);
    setSubmission(finalSub);
    showSuccess("🎉 Project officially submitted to Hackathon jury!");
  };

  const sendInvitation = async (candidateId, message) => {
    const res = await mockTeamService.sendInvitation(candidateId, message);
    showSuccess(res.message);
    return res;
  };

  const respondInvitation = async (invitationId, accept) => {
    const updated = await mockTeamService.respondInvitation(invitationId, accept);
    setInvitations(updated);
    showSuccess(accept ? "Invitation accepted!" : "Invitation declined");
  };

  return (
    <TeamContext.Provider value={{
      currentTeam,
      tasks,
      submission,
      invitations,
      isLoading,
      updateTaskStatus,
      addTask,
      updateSubmission,
      submitProject,
      sendInvitation,
      respondInvitation,
      reloadTeam: loadData
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
};
