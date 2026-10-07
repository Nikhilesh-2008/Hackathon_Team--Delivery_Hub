# Backend Integration Guide for HackHub

This document guides backend teammates on how to transition **HackHub (Hackathon Team & Delivery Hub)** from its current frontend mock services to real production APIs without rewriting the user interface.

---

## 1. Architecture Overview
All UI components in HackHub interact with services located under `src/services/`. **No mock data is hardcoded inside React components.**

```text
React Components (UI)
        ↓
Context Providers (Auth, Team, Toast)
        ↓
Service Layer (src/services/mock*.js)  <-- REPLACE WITH REAL AXIOS / FETCH CALLS
        ↓
REST / GraphQL Backend (Node.js / Express / Fastify / Django / MongoDB)
```

---

## 2. Service Replacement Roadmap

### A. Authentication & Profiles (`mockAuthService.js`, `mockProfileService.js`)
- **Endpoints to implement**:
  - `POST /api/auth/login` & `POST /api/auth/register`
  - `GET /api/users/me`
  - `PUT /api/users/me` (Profile bio, skills, availability)
  - `GET /api/candidates?specialization=&skill=&query=` (Natural language & vector search)
- **Vector Search / RAG note**:
  - The natural language query from `TeamFinder.jsx` (`/api/candidates?query=...`) can be routed to an Atlas Vector Search or ChromaDB instance containing candidate bio embeddings.

### B. Events & Challenges (`mockEventService.js`)
- **Endpoints to implement**:
  - `GET /api/hackathons?category=&search=`
  - `GET /api/hackathons/:id`
  - `POST /api/hackathons` (Organizer creation)
  - `GET /api/hackathons/:id/challenges/:challengeId`

### C. Teams & Sprints (`mockTeamService.js`)
- **Endpoints to implement**:
  - `GET /api/teams/my-team`
  - `POST /api/teams/invitations` (Send candidate invitation)
  - `PUT /api/teams/invitations/:id` (Accept/Decline)
  - `GET /api/teams/:id/tasks`
  - `POST /api/teams/:id/tasks` (Add sprint task)
  - `PATCH /api/teams/:id/tasks/:taskId` (Status transitions: TODO, IN_PROGRESS, BLOCKED, COMPLETED)
  - `POST /api/teams/:id/chat` (Or WebSocket room `team:${teamId}`)

### D. Submissions & Jury Evaluation (`mockSubmissionService.js`)
- **Endpoints to implement**:
  - `GET /api/submissions/:teamId`
  - `PUT /api/submissions/:teamId/draft`
  - `POST /api/submissions/:teamId/finalize`
  - `POST /api/evaluations/:submissionId` (Judge 100-point rubric submission)

### E. AI Services (`mockAiService.js`)
- **Endpoints to implement**:
  - `POST /api/ai/rulebook-query` (RAG search on ingested rulebook PDF)
  - `POST /api/ai/delivery-plan` (Agent assessment calculating remaining milestone hours vs deadline)

---

## 3. How to Connect Axios / Fetch Client
Create an API client in `src/services/apiClient.js`:

```javascript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Then swap the exported mock functions in `src/services/` with real `apiClient` requests. The UI will seamlessly render live backend data without requiring component refactoring.
