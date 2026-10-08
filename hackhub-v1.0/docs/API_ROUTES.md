# HackHub — Canonical API Route Specification & Architecture

**Document Version:** 1.0.0  
**Target:** Backend Engineers, Frontend Engineers, AI Integration Engineers, QA  
**Specification:** RESTful JSON API backed by Express.js and MongoDB Mongoose  
**Canonical Prefix:** `/api` (Strictly enforced)

---

## 1. Architectural Principles

1. **Single Source of Truth**: All backend routes are declared in `server/routes/routeRegistry.js` and consumed by `src/services/apiRoutes.js`.
2. **Three-Tier Architecture**:
   `Routes` → `Controllers` → `Services` → `Models`
   No business logic resides directly in route definition files.
3. **Optimistic Concurrency Control**: Tasks use strict version checking (`{ version: currentVersion }` with `$inc: { version: 1 }`). Mismatches return `409 Conflict`.
4. **Server-Side Deadline Enforcement**: Project submission endpoints compare current server time (`Date.now()`) with `Event.submissionDeadline`. Client timestamps are never trusted.
5. **Role & Assignment Isolation**:
   - Mentors can only guide assigned teams and cannot score or alter submissions.
   - Judges cannot evaluate teams where they hold active membership (Conflict of Interest protection).
   - Only team captains can approve AI Delivery Planner milestone changes or submit final deliverables.
6. **Isolated RAG Rulebook Q&A**: Vector and text chunk retrieval is strictly partitioned by `eventId`. Cross-event rule leakage is prohibited.

---

## 2. Global Standard Response Format

### Success (Single Resource)
```json
{
  "success": true,
  "data": { ... }
}
```

### Collection (Paginated Array)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Team not found",
    "details": [ ... ]
  }
}
```

---

## 3. Canonical API Route Registry Table

| Method | Route | Auth | Role | Purpose | Controller | Service |
|:-------|:------|:----:|:-----|:--------|:-----------|:--------|
| **HEALTH** | | | | | | |
| GET | `/api/health` | No | Public | API service liveness and database connection status | HealthController.checkHealth | HealthService.checkHealth |
| **AUTH** | | | | | | |
| POST | `/api/auth/register` | No | Public | Register new participant user account and initialize profile | AuthController.register | AuthService.register |
| POST | `/api/auth/verify-email` | No | Public | Verify user email address with verification token | AuthController.verifyEmail | AuthService.verifyEmail |
| POST | `/api/auth/login` | No | Public | Authenticate user credentials, return JWT token and create session | AuthController.login | AuthService.login |
| POST | `/api/auth/forgot-password` | No | Public | Initiate password reset request and email token | AuthController.forgotPassword | AuthService.forgotPassword |
| POST | `/api/auth/reset-password` | No | Public | Complete password reset using secure token | AuthController.resetPassword | AuthService.resetPassword |
| GET | `/api/auth/me` | Yes | ALL | Get authenticated user context, profile summary, teams, and reputation | AuthController.getMe | AuthService.getMe |
| POST | `/api/auth/logout` | Yes | ALL | Invalidate current session and revoke tokens | AuthController.logout | AuthService.logout |
| POST | `/api/auth/change-password` | Yes | ALL | Update authenticated user account password | AuthController.changePassword | AuthService.changePassword |
| POST | `/api/auth/invitations` | Yes | ORGANIZER, ADMIN | Invite new judge or mentor staff member to the platform | AuthController.createStaffInvitation | AuthService.createStaffInvitation |
| POST | `/api/auth/invitations/:invitationId/accept` | Yes | ALL | Accept platform staff invitation and elevate user role | AuthController.acceptStaffInvitation | AuthService.acceptStaffInvitation |
| DELETE | `/api/auth/invitations/:invitationId` | Yes | ORGANIZER, ADMIN | Revoke pending platform staff invitation | AuthController.revokeStaffInvitation | AuthService.revokeStaffInvitation |
| **EVENTS** | | | | | | |
| GET | `/api/events` | No | Public | List published and active hackathons with optional category/search filters | EventController.listEvents | EventService.listEvents |
| GET | `/api/events/:eventId` | No | Public | Get comprehensive event details, track challenges, and active rubric | EventController.getEventById | EventService.getEventById |
| POST | `/api/events` | Yes | ORGANIZER, ADMIN | Create new hackathon event (defaults to draft status) | EventController.createEvent | EventService.createEvent |
| PATCH | `/api/events/:eventId` | Yes | ORGANIZER, ADMIN | Update event metadata, schedule dates, or settings | EventController.updateEvent | EventService.updateEvent |
| POST | `/api/events/:eventId/publish` | Yes | ORGANIZER, ADMIN | Transition draft event to published status for public discovery | EventController.publishEvent | EventService.publishEvent |
| POST | `/api/events/:eventId/lock-submissions` | Yes | ORGANIZER, ADMIN | Officially lock submissions window for an event | EventController.lockSubmissions | EventService.lockSubmissions |
| GET | `/api/events/:eventId/challenges` | No | Public | List challenge tracks associated with a specific event | ChallengeController.listChallenges | ChallengeService.listChallenges |
| PATCH | `/api/events/:eventId/assignments` | Yes | ORGANIZER, ADMIN | Assign mentors or judges to event submissions and teams | EventController.assignStaff | EventService.assignStaff |
| **CHALLENGES** | | | | | | |
| GET | `/api/events/:eventId/challenges/:challengeId` | No | Public | Get specific challenge problem statement, requirements, and tags | ChallengeController.getChallengeById | ChallengeService.getChallengeById |
| POST | `/api/events/:eventId/challenges` | Yes | ORGANIZER, ADMIN | Create new challenge problem statement under an event | ChallengeController.createChallenge | ChallengeService.createChallenge |
| PATCH | `/api/challenges/:challengeId` | Yes | ORGANIZER, ADMIN | Update challenge details, requirements, or skills | ChallengeController.updateChallenge | ChallengeService.updateChallenge |
| **PROFILES** | | | | | | |
| GET | `/api/profiles/me` | Yes | ALL | Retrieve authenticated user detailed profile | ProfileController.getMyProfile | ProfileService.getMyProfile |
| PATCH | `/api/profiles/me` | Yes | ALL | Update user profile bio, skills, availability, and discoveryConsent | ProfileController.updateMyProfile | ProfileService.updateMyProfile |
| **DISCOVERY** | | | | | | |
| POST | `/api/discovery/challenges` | No | Public | Filter and search challenges by difficulty, tags, or keywords | DiscoveryController.discoverChallenges | DiscoveryService.discoverChallenges |
| POST | `/api/discovery/teammates` | Yes | PARTICIPANT, ORGANIZER, ADMIN | Discover candidate teammates respecting discoveryConsent === true | DiscoveryController.discoverTeammates | DiscoveryService.discoverTeammates |
| **TEAMS** | | | | | | |
| POST | `/api/teams` | Yes | PARTICIPANT, ADMIN | Create new team within an event and assign creator as captain | TeamController.createTeam | TeamService.createTeam |
| GET | `/api/teams/:teamId` | Yes | Team Members, Staff | Get team workspace summary, challenge, decisions, and progress | TeamController.getTeamById | TeamService.getTeamById |
| PATCH | `/api/teams/:teamId` | Yes | Team Captain, ADMIN | Update team name, description, or technical decisions | TeamController.updateTeam | TeamService.updateTeam |
| GET | `/api/teams/:teamId/members` | Yes | ALL | List active members of a team with roles and responsibilities | TeamController.getTeamMembers | TeamService.getTeamMembers |
| **JOIN REQUESTS** | | | | | | |
| POST | `/api/teams/:teamId/join-requests` | Yes | PARTICIPANT, ADMIN | Submit join request to a team (prevents duplicate pending requests) | JoinRequestController.createJoinRequest | JoinRequestService.createJoinRequest |
| GET | `/api/teams/:teamId/join-requests` | Yes | Team Captain, ADMIN | List pending join requests for a team | JoinRequestController.getTeamJoinRequests | JoinRequestService.getTeamJoinRequests |
| POST | `/api/join-requests/:requestId/accept` | Yes | Team Captain, ADMIN | Accept join request and create active Membership record | JoinRequestController.acceptJoinRequest | JoinRequestService.acceptJoinRequest |
| POST | `/api/join-requests/:requestId/reject` | Yes | Team Captain, ADMIN | Reject pending team join request | JoinRequestController.rejectJoinRequest | JoinRequestService.rejectJoinRequest |
| DELETE | `/api/join-requests/:requestId` | Yes | Requester, Captain, ADMIN | Cancel or withdraw pending join request | JoinRequestController.cancelJoinRequest | JoinRequestService.cancelJoinRequest |
| **INVITATIONS** | | | | | | |
| POST | `/api/teams/:teamId/invitations` | Yes | Team Captain, ADMIN | Send team invitation to a candidate (prevents duplicate pending) | InvitationController.createInvitation | InvitationService.createInvitation |
| GET | `/api/teams/:teamId/invitations` | Yes | Team Captain, ADMIN | Get sent invitations for a team | InvitationController.getTeamInvitations | InvitationService.getTeamInvitations |
| POST | `/api/invitations/:invitationId/accept` | Yes | Invitee, ADMIN | Accept team invitation and become active member | InvitationController.acceptInvitation | InvitationService.acceptInvitation |
| POST | `/api/invitations/:invitationId/reject` | Yes | Invitee, ADMIN | Decline team invitation | InvitationController.rejectInvitation | InvitationService.rejectInvitation |
| DELETE | `/api/invitations/:invitationId` | Yes | Inviter, Captain, ADMIN | Cancel sent team invitation | InvitationController.cancelInvitation | InvitationService.cancelInvitation |
| **TASKS** | | | | | | |
| GET | `/api/teams/:teamId/tasks` | Yes | Team Members, Mentors, Staff | List Kanban sprint tasks for team | TaskController.getTeamTasks | TaskService.getTeamTasks |
| POST | `/api/teams/:teamId/tasks` | Yes | Team Members, ADMIN | Create new task in team sprint Kanban board | TaskController.createTask | TaskService.createTask |
| GET | `/api/tasks/:taskId` | Yes | Team Members, Mentors, Staff | Get specific task details and history | TaskController.getTaskById | TaskService.getTaskById |
| PATCH | `/api/tasks/:taskId` | Yes | Team Members, ADMIN | Update task with optimistic concurrency (version check -> 409 if conflict) | TaskController.updateTask | TaskService.updateTask |
| DELETE | `/api/tasks/:taskId` | Yes | Team Members, ADMIN | Delete task from team Kanban board | TaskController.deleteTask | TaskService.deleteTask |
| **MILESTONES** | | | | | | |
| GET | `/api/teams/:teamId/milestones` | Yes | Team Members, Mentors, Staff | List milestones and completion percentages for team | MilestoneController.getTeamMilestones | MilestoneService.getTeamMilestones |
| POST | `/api/teams/:teamId/milestones` | Yes | Team Members, ADMIN | Create new project milestone with target date | MilestoneController.createMilestone | MilestoneService.createMilestone |
| PATCH | `/api/milestones/:milestoneId` | Yes | Team Members, ADMIN | Update milestone status, description, or completion percentage | MilestoneController.updateMilestone | MilestoneService.updateMilestone |
| DELETE | `/api/milestones/:milestoneId` | Yes | Team Captain, ADMIN | Remove milestone from project plan | MilestoneController.deleteMilestone | MilestoneService.deleteMilestone |
| **SUBMISSIONS** | | | | | | |
| GET | `/api/teams/:teamId/checklist` | Yes | Team Members, Jurors, Staff | Get dynamically derived submission readiness % and deadline status | SubmissionController.getSubmissionChecklist | SubmissionService.getSubmissionChecklist |
| GET | `/api/teams/:teamId/submission` | Yes | Team Members, Jurors, Staff | Get submission draft or final submission details for team | SubmissionController.getTeamSubmission | SubmissionService.getTeamSubmission |
| POST | `/api/teams/:teamId/submission` | Yes | Team Captain, ADMIN | Save draft or submit final project (enforces server-side deadline) | SubmissionController.upsertSubmission | SubmissionService.upsertSubmission |
| PATCH | `/api/teams/:teamId/submission` | Yes | Team Captain, ADMIN | Patch draft submission attributes before deadline | SubmissionController.updateSubmissionDraft | SubmissionService.updateSubmissionDraft |
| GET | `/api/submissions/:submissionId` | Yes | Team Members, Jurors, Staff | Get submission details by direct submission ID | SubmissionController.getSubmissionById | SubmissionService.getSubmissionById |
| POST | `/api/submissions/:submissionId/submit` | Yes | Team Captain, ADMIN | Finalize and lock project submission before event deadline | SubmissionController.submitFinalSubmission | SubmissionService.submitFinalSubmission |
| **RUBRICS** | | | | | | |
| GET | `/api/events/:eventId/rubric` | No | Public | Get active versioned rubric and criteria for an event | RubricController.getEventRubric | RubricService.getEventRubric |
| GET | `/api/rubrics/:rubricId` | Yes | ALL | Get rubric by unique rubric ID | RubricController.getRubricById | RubricService.getRubricById |
| POST | `/api/events/:eventId/rubric` | Yes | ORGANIZER, ADMIN | Create new versioned evaluation rubric for an event | RubricController.createRubric | RubricService.createRubric |
| PATCH | `/api/rubrics/:rubricId` | Yes | ORGANIZER, ADMIN | Update rubric criteria and scoring weights | RubricController.updateRubric | RubricService.updateRubric |
| **MENTOR** | | | | | | |
| GET | `/api/mentor/teams` | Yes | MENTOR, ADMIN | List teams assigned to current authenticated mentor | MentorController.getAssignedTeams | MentorService.getAssignedTeams |
| GET | `/api/teams/:teamId/feedback` | Yes | Team Members, Mentors, Staff | List mentor guidance and feedback records for a team | MentorController.getTeamFeedback | MentorService.getTeamFeedback |
| POST | `/api/teams/:teamId/feedback` | Yes | MENTOR, ADMIN | Post actionable mentor feedback and recommendations | MentorController.createFeedback | MentorService.createFeedback |
| **JUDGE** | | | | | | |
| GET | `/api/judge/submissions` | Yes | JUDGE, ADMIN | List event submissions assigned to judge for evaluation | JudgeController.getAssignedSubmissions | JudgeService.getAssignedSubmissions |
| GET | `/api/submissions/:submissionId/scores` | Yes | JUDGE, ORGANIZER, ADMIN | Retrieve recorded evaluation scores for a submission | JudgeController.getSubmissionScores | JudgeService.getSubmissionScores |
| POST | `/api/submissions/:submissionId/scores` | Yes | JUDGE, ADMIN | Submit 100-point rubric evaluation score (prohibits self-team scoring) | JudgeController.submitScore | JudgeService.submitScore |
| **ORGANIZER** | | | | | | |
| GET | `/api/organizer/events` | Yes | ORGANIZER, ADMIN | List hackathon events organized by authenticated user | OrganizerController.getOrganizerEvents | OrganizerService.getOrganizerEvents |
| GET | `/api/organizer/events/:eventId` | Yes | ORGANIZER, ADMIN | Get comprehensive organizer metrics, submissions tally, and disputes | OrganizerController.getOrganizerEventDetails | OrganizerService.getOrganizerEventDetails |
| **DOCUMENTS / RULEBOOK** | | | | | | |
| POST | `/api/events/:eventId/documents` | Yes | ORGANIZER, ADMIN | Upload new rulebook PDF or markdown document for ingestion | DocumentController.uploadDocument | DocumentService.uploadDocument |
| GET | `/api/events/:eventId/documents` | Yes | ALL | List rulebook documents uploaded for an event | DocumentController.getEventDocuments | DocumentService.getEventDocuments |
| GET | `/api/documents/:documentId` | Yes | ALL | Get document details, chunk count, and processing state | DocumentController.getDocumentById | DocumentService.getDocumentById |
| POST | `/api/documents/:documentId/retry` | Yes | ORGANIZER, ADMIN | Retry extraction and embedding pipeline for failed document | DocumentController.retryDocumentProcessing | DocumentService.retryDocumentProcessing |
| DELETE | `/api/documents/:documentId` | Yes | ORGANIZER, ADMIN | Delete document and cascade remove all parsed chunks | DocumentController.deleteDocument | DocumentService.deleteDocument |
| **RAG / RULEBOOK Q&A** | | | | | | |
| POST | `/api/events/:eventId/rulebook/query` | Yes | ALL | Query event rulebook with strict event-scoped chunk retrieval and citations | RagController.queryRulebook | RagService.queryRulebook |
| **AI DELIVERY PLANNER** | | | | | | |
| POST | `/api/teams/:teamId/ai/delivery-plan` | Yes | ALL | Generate read-only delivery assessment and proposal via AgentRun | AgentController.generateDeliveryPlan | AgentService.generateDeliveryPlan |
| POST | `/api/teams/:teamId/ai/delivery-plan/:agentRunId/confirm` | Yes | Team Captain, ADMIN | Captain approves and applies delivery plan milestones | AgentController.confirmDeliveryPlan | AgentService.confirmDeliveryPlan |
| POST | `/api/teams/:teamId/ai/delivery-plan/:agentRunId/cancel` | Yes | Team Captain, ADMIN | Reject and discard proposed delivery plan proposal | AgentController.cancelDeliveryPlan | AgentService.cancelDeliveryPlan |
| **NOTIFICATIONS** | | | | | | |
| GET | `/api/notifications` | Yes | ALL | List notifications for current user with unread counts | NotificationController.getMyNotifications | NotificationService.getMyNotifications |
| PATCH | `/api/notifications/:notificationId/read` | Yes | ALL | Mark specific notification as read (PATCH) | NotificationController.markNotificationRead | NotificationService.markNotificationRead |
| POST | `/api/notifications/:notificationId/read` | Yes | ALL | Mark specific notification as read (POST alias) | NotificationController.markNotificationRead | NotificationService.markNotificationRead |
| **REPUTATION** | | | | | | |
| GET | `/api/reputation/me` | Yes | ALL | Get aggregated reputation score and points history for current user | ReputationController.getMyReputation | ReputationService.getMyReputation |
| GET | `/api/users/:userId/reputation` | Yes | ALL | Get public reputation points and ledger history for any user | ReputationController.getUserReputation | ReputationService.getUserReputation |
