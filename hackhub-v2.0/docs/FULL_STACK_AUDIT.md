# HackHub — Comprehensive Full-Stack Audit & System Status

## 1. Traceability & System Audit Matrix

| Feature | Frontend Page / Component | Frontend Service | API Endpoint | Backend Route & Controller | MongoDB Model & Collection | Real/Mock Status | Audit Observations & Recommendations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Server Health** | `Topbar.jsx` | `api.js` | `GET /api/health` | `healthRoutes.js` | `mongoose.connection` | **REAL** | Active live status badge (`API: Online`). |
| **Authentication & Users** | `LoginPage.jsx`, `AuthContext.jsx` | `mockAuthService.js` -> `authApi.js` | `POST /api/auth/login`<br>`POST /api/auth/register`<br>`GET /api/auth/me` | `authRoutes.js`<br>`authController.js` | `User.js` (`users`) | **HYBRID** | Backend works. Login page currently focuses on persona switching; need real email/password form mode alongside demo personas. |
| **Profile Management** | `ProfilePage.jsx` | `mockProfileService.js` -> `profileApi.js` | `GET /api/profile/me`<br>`PUT /api/profile/me`<br>`GET /api/profile/:id` | `profileRoutes.js`<br>`profileController.js` | `Profile.js` (`profiles`) | **REAL** | Real MongoDB Profile update and fetch. Seeded with 8 profiles. |
| **Team Finder & Matching** | `TeamFinder.jsx`, `CandidateCard.jsx` | `mockProfileService.js` -> `profileApi.js` | `GET /api/profiles?query=...` | `profileRoutes.js`<br>`profileController.js` | `Profile.js` (`profiles`) | **REAL** | Natural language and keyword search queries MongoDB with score explainability. |
| **Events & Challenges** | `DiscoverEvents.jsx`, `HackathonDetails.jsx` | `mockEventService.js` -> `eventApi.js` | `GET /api/events`<br>`GET /api/events/:id` | `eventRoutes.js`<br>`eventController.js` | `Event.js` (`events`) | **REAL** | Fetches active and upcoming hackathons from MongoDB. |
| **Team Workspace & Chat** | `TeamWorkspace.jsx` | `mockTeamService.js` -> `teamApi.js` | `GET /api/teams/my-team`<br>`POST /api/teams` | `teamRoutes.js`<br>`teamController.js` | `Team.js` (`teams`) | **REAL** | Loads team members, sprint progress, and decisions from DB. |
| **Team Invitations** | `TeamFinder.jsx` (Modal), `NotificationsPage.jsx` | `mockTeamService.js` -> `invitationApi.js` | `POST /api/teams/invitations`<br>`PATCH /api/teams/invitations/:id` | `teamRoutes.js`<br>`teamController.js` | `TeamInvitation.js`<br>`Notification.js` | **REAL** | Sending invite creates DB invitation & notification. Accepting updates Team members. |
| **Tasks & Kanban** | `TasksTimeline.jsx` | `mockTeamService.js` -> `taskApi.js` | `GET /api/tasks`<br>`POST /api/tasks`<br>`PATCH /api/tasks/:id/status` | `taskRoutes.js`<br>`taskController.js` | `Task.js` (`tasks`) | **REAL** | Status change updates task in DB and auto-recomputes team progress %. |
| **Project Submission** | `SubmissionHub.jsx` | `mockTeamService.js` -> `submissionApi.js` | `GET /api/submission`<br>`PUT /api/submission`<br>`POST /api/submission/submit` | `operationsRoutes.js`<br>`operationsController.js` | `Submission.js` (`submissions`) | **REAL** | Checklist and URLs persist in MongoDB. |
| **Mentor Feedback** | `MentorDashboard.jsx` | `mockTeamService.js` -> `feedbackApi.js` | `GET /api/feedback`<br>`POST /api/feedback` | `operationsRoutes.js`<br>`operationsController.js` | `MentorFeedback.js` (`mentorfeedbacks`) | **REAL** | Faculty mentor reviews persist to MongoDB and appear in team log. |
| **Judge Scoring** | `JudgeDashboard.jsx` | `mockTeamService.js` -> `judgeApi.js` | `POST /api/scores` | `operationsRoutes.js`<br>`operationsController.js` | `JudgeScore.js` (`judgescores`) | **REAL** | 100-point rubric total is computed and verified on backend. |
| **Reputation History** | `ReputationPage.jsx` | `mockNotificationService.js` -> `reputationApi.js` | `GET /api/reputation` | `operationsRoutes.js`<br>`operationsController.js` | `Reputation.js` (`reputations`) | **REAL** | History entries and point gains loaded from database. |
| **Notifications** | `Topbar.jsx`, `NotificationsPage.jsx` | `mockNotificationService.js` -> `notificationApi.js` | `GET /api/notifications`<br>`PATCH /api/notifications/read-all` | `operationsRoutes.js`<br>`operationsController.js` | `Notification.js` (`notifications`) | **REAL** | Real-time unread badges and mark-all-read mutations. |
| **AI Rulebook Assistant** | `RulebookPage.jsx` | `mockAiService.js` | Simulated Client Q&A | Local RAG simulation | N/A | **MOCK AI** | As designed, AI is simulated until future Vector Search phase. |
| **AI Delivery Planner** | `AiPlanner.jsx` | `mockAiService.js` | Simulated Velocity Forecast | Local Agent simulation | N/A | **MOCK AI** | Interactive approve/reject flow functioning. |

---

## 2. Key Findings & Identified Areas for Improvement

1. **Service Layer Naming**:
   - Files were originally named `mockAuthService.js`, `mockTeamService.js`, etc. Even though they now call the real backend `api.js`, the filenames cause confusion.
   - **Resolution**: Create direct, clean API service modules (`authApi.js`, `profileApi.js`, `eventApi.js`, `teamApi.js`, `taskApi.js`, `submissionApi.js`, `feedbackApi.js`, `reputationApi.js`, `notificationApi.js`, `aiApi.js`) with backward-compatible aliases.

2. **Login / Register UI Enhancement**:
   - Currently, `LoginPage.jsx` provides one-click Demo Persona entry, but does not provide real email/password login and registration input forms.
   - **Resolution**: Add email/password tabs for real registration & login while keeping Demo Personas accessible for quick evaluation.

3. **Immediate Mutation Propagation**:
   - Improve state invalidation in React contexts so when tasks, invitations, or profiles update, dependent widgets (like dashboard stats or team progress bars) refresh immediately without delay.

4. **Error Handling & User Feedback**:
   - Ensure every API error (400, 401, 403, 404, 500) displays friendly toast notifications with specific validation details instead of generic warnings.
