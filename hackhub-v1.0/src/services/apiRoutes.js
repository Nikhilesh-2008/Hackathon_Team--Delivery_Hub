/**
 * HackHub Frontend Canonical API Route Registry
 * 
 * Authoritative single source of truth for frontend services,
 * mapping exactly to backend routes in server/routes/routeRegistry.js.
 */

export const API_BASE_URL = typeof window !== 'undefined' && window.__API_BASE_URL__
  ? window.__API_BASE_URL__
  : '/api';

export const apiRoutes = {
  // HEALTH
  health: {
    check: () => '/api/health',
  },

  // AUTH
  auth: {
    register: () => '/api/auth/register',
    verifyEmail: () => '/api/auth/verify-email',
    login: () => '/api/auth/login',
    forgotPassword: () => '/api/auth/forgot-password',
    resetPassword: () => '/api/auth/reset-password',
    me: () => '/api/auth/me',
    logout: () => '/api/auth/logout',
    changePassword: () => '/api/auth/change-password',
    invitations: () => '/api/auth/invitations',
    acceptInvitation: (invitationId) => `/api/auth/invitations/${invitationId}/accept`,
    revokeInvitation: (invitationId) => `/api/auth/invitations/${invitationId}`,
  },

  // EVENTS
  events: {
    list: () => '/api/events',
    byId: (eventId) => `/api/events/${eventId}`,
    create: () => '/api/events',
    update: (eventId) => `/api/events/${eventId}`,
    publish: (eventId) => `/api/events/${eventId}/publish`,
    lockSubmissions: (eventId) => `/api/events/${eventId}/lock-submissions`,
    challenges: (eventId) => `/api/events/${eventId}/challenges`,
    assignments: (eventId) => `/api/events/${eventId}/assignments`,
    rubric: (eventId) => `/api/events/${eventId}/rubric`,
    documents: (eventId) => `/api/events/${eventId}/documents`,
    rulebookQuery: (eventId) => `/api/events/${eventId}/rulebook/query`,
  },

  // CHALLENGES
  challenges: {
    byEvent: (eventId) => `/api/events/${eventId}/challenges`,
    byId: (eventId, challengeId) => `/api/events/${eventId}/challenges/${challengeId}`,
    create: (eventId) => `/api/events/${eventId}/challenges`,
    update: (challengeId) => `/api/challenges/${challengeId}`,
  },

  // PROFILES
  profiles: {
    me: () => '/api/profiles/me',
  },

  // DISCOVERY
  discovery: {
    challenges: () => '/api/discovery/challenges',
    teammates: () => '/api/discovery/teammates',
  },

  // TEAMS
  teams: {
    create: () => '/api/teams',
    byId: (teamId) => `/api/teams/${teamId}`,
    update: (teamId) => `/api/teams/${teamId}`,
    members: (teamId) => `/api/teams/${teamId}/members`,
    joinRequests: (teamId) => `/api/teams/${teamId}/join-requests`,
    invitations: (teamId) => `/api/teams/${teamId}/invitations`,
    tasks: (teamId) => `/api/teams/${teamId}/tasks`,
    milestones: (teamId) => `/api/teams/${teamId}/milestones`,
    checklist: (teamId) => `/api/teams/${teamId}/checklist`,
    submission: (teamId) => `/api/teams/${teamId}/submission`,
    feedback: (teamId) => `/api/teams/${teamId}/feedback`,
    aiDeliveryPlan: (teamId) => `/api/teams/${teamId}/ai/delivery-plan`,
    aiConfirmPlan: (teamId, agentRunId) => `/api/teams/${teamId}/ai/delivery-plan/${agentRunId}/confirm`,
    aiCancelPlan: (teamId, agentRunId) => `/api/teams/${teamId}/ai/delivery-plan/${agentRunId}/cancel`,
  },

  // JOIN REQUESTS
  joinRequests: {
    accept: (requestId) => `/api/join-requests/${requestId}/accept`,
    reject: (requestId) => `/api/join-requests/${requestId}/reject`,
    cancel: (requestId) => `/api/join-requests/${requestId}`,
  },

  // INVITATIONS
  invitations: {
    accept: (invitationId) => `/api/invitations/${invitationId}/accept`,
    reject: (invitationId) => `/api/invitations/${invitationId}/reject`,
    cancel: (invitationId) => `/api/invitations/${invitationId}`,
  },

  // TASKS
  tasks: {
    byId: (taskId) => `/api/tasks/${taskId}`,
    update: (taskId) => `/api/tasks/${taskId}`,
    delete: (taskId) => `/api/tasks/${taskId}`,
  },

  // MILESTONES
  milestones: {
    update: (milestoneId) => `/api/milestones/${milestoneId}`,
    delete: (milestoneId) => `/api/milestones/${milestoneId}`,
  },

  // SUBMISSIONS
  submissions: {
    byId: (submissionId) => `/api/submissions/${submissionId}`,
    submit: (submissionId) => `/api/submissions/${submissionId}/submit`,
    scores: (submissionId) => `/api/submissions/${submissionId}/scores`,
  },

  // RUBRICS
  rubrics: {
    byId: (rubricId) => `/api/rubrics/${rubricId}`,
    update: (rubricId) => `/api/rubrics/${rubricId}`,
  },

  // MENTOR
  mentor: {
    teams: () => '/api/mentor/teams',
  },

  // JUDGE
  judge: {
    submissions: () => '/api/judge/submissions',
  },

  // ORGANIZER
  organizer: {
    events: () => '/api/organizer/events',
    eventById: (eventId) => `/api/organizer/events/${eventId}`,
  },

  // DOCUMENTS
  documents: {
    byId: (documentId) => `/api/documents/${documentId}`,
    retry: (documentId) => `/api/documents/${documentId}/retry`,
    delete: (documentId) => `/api/documents/${documentId}`,
  },

  // NOTIFICATIONS
  notifications: {
    list: () => '/api/notifications',
    markRead: (notificationId) => `/api/notifications/${notificationId}/read`,
  },

  // REPUTATION
  reputation: {
    me: () => '/api/reputation/me',
    byUser: (userId) => `/api/users/${userId}/reputation`,
  },
};

export default apiRoutes;
