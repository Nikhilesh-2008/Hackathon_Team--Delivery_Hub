import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTeamService, mockTaskService, mockSubmissionService } from '../services/mockTeamService';
import { useToast } from './ToastContext';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    const t = await mockTeamService.getCurrentTeam();
    const tsk = await mockTaskService.getTasks();
    const sub = await mockSubmissionService.getSubmission();
    const inv = await mockTeamService.getInvitations();
    setCurrentTeam(t);
    setTasks(tsk);
    setSubmission(sub);
    setInvitations(inv);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
