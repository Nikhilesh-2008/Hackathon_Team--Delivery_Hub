import { mockTeams, mockTasks, mockTimeline } from '../data/teams';
import { mockFeedback, mockInvitations } from '../data/reputation';

const TEAM_KEY = 'hackhub_team_nova';
const TASKS_KEY = 'hackhub_tasks';
const INVITATIONS_KEY = 'hackhub_invitations';
const SUBMISSION_KEY = 'hackhub_submission';

export const mockTeamService = {
  getCurrentTeam: async () => {
    const saved = localStorage.getItem(TEAM_KEY);
    return saved ? JSON.parse(saved) : mockTeams[0];
  },

  getAllTeams: async () => {
    return mockTeams;
  },

  updateTeam: async (teamData) => {
    const current = await mockTeamService.getCurrentTeam();
    const updated = { ...current, ...teamData };
    localStorage.setItem(TEAM_KEY, JSON.stringify(updated));
    return updated;
  },

  sendInvitation: async (candidateId, message) => {
    return {
      success: true,
      message: `Invitation sent to candidate successfully!`
    };
  },

  getInvitations: async () => {
    const saved = localStorage.getItem(INVITATIONS_KEY);
    return saved ? JSON.parse(saved) : mockInvitations;
  },

  respondInvitation: async (invitationId, accept = true) => {
    const list = await mockTeamService.getInvitations();
    const updated = list.map((inv) => inv.id === invitationId ? { ...inv, status: accept ? 'ACCEPTED' : 'REJECTED' } : inv);
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  getMentorFeedback: async () => {
    return mockFeedback;
  },

  addMentorFeedback: async (feedback) => {
    const newEntry = {
      id: `fb_${Date.now()}`,
      timestamp: 'Just now',
      ...feedback
    };
    return newEntry;
  }
};

export const mockTaskService = {
  getTasks: async () => {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : mockTasks;
  },

  updateTaskStatus: async (taskId, newStatus) => {
    const list = await mockTaskService.getTasks();
    const updated = list.map((t) => t.id === taskId ? { ...t, status: newStatus } : t);
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  },

  addTask: async (taskData) => {
    const list = await mockTaskService.getTasks();
    const newTask = {
      id: `task_${Date.now()}`,
      status: 'TODO',
      ...taskData
    };
    const updated = [newTask, ...list];
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  },

  getTimeline: async () => {
    return mockTimeline;
  }
};

export const mockSubmissionService = {
  getSubmission: async () => {
    const saved = localStorage.getItem(SUBMISSION_KEY);
    return saved ? JSON.parse(saved) : {
      githubUrl: "https://github.com/karthik-dev/ai-study-planner",
      liveUrl: "https://study-planner-demo.vercel.app",
      demoVideoUrl: "",
      presentationUrl: "https://docs.google.com/presentation/d/mock-slides",
      description: "Intelligent adaptive syllabus roadmap and automated quiz diagnostic platform.",
      checklist: {
        githubRepo: true,
        deploymentLink: true,
        projectDescription: true,
        presentationDeck: true,
        demoVideo: false,
        finalTesting: false
      },
      status: "DRAFT", // "DRAFT" | "SUBMITTED"
      submittedAt: null
    };
  },

  saveSubmission: async (data) => {
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(data));
    return data;
  },

  submitProject: async (data) => {
    const submission = {
      ...data,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission));
    return submission;
  }
};
