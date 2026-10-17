# HackHub backend

Express and MongoDB API for the existing React client. API paths are mounted under `/api`; keep these paths and the `{ success, data, message }` response shape stable when adding features.

## Local setup

1. Install Node.js and MongoDB.
2. From this directory, copy `.env.example` to `.env` and set `MONGODB_URI` and a private, random `JWT_SECRET` of at least 32 characters.
3. Run `npm install`, then `npm run dev`.
4. Set the frontend's `VITE_API_URL` to `http://localhost:5000/api`.

The API starts only after MongoDB connects and refuses to start without a configured JWT secret. Do not commit `.env` or real secrets.

## Route ownership

| Area | Existing API prefix | Code |
| --- | --- | --- |
| Authentication and profiles | `/api/auth`, `/api/profile`, `/api/profiles` | `src/routes/authRoutes.js`, `profileRoutes.js` |
| Events and challenges | `/api/events` | `src/routes/eventRoutes.js` |
| Teams and invitations | `/api/teams` | `src/routes/teamRoutes.js` |
| Sprint tasks | `/api/tasks` | `src/routes/taskRoutes.js` |
| Submissions, feedback, scores, reputation, notifications | `/api/submission`, `/api/feedback`, `/api/scores`, `/api/reputation`, `/api/notifications` | `src/routes/operationsRoutes.js` |
| Health | `/api/health` | `src/routes/healthRoutes.js` |

The chatbot/LLM integration belongs to its own route module when that work is ready; it should use a separate, agreed prefix and must not replace or shadow the routes above.

## Authentication

Send `Authorization: Bearer <token>` for protected routes. Registration creates Participant accounts; privileged roles must be assigned through a trusted administrative process. Organizer/Admin access is required for event authoring, Mentor/Admin for feedback creation, and Judge/Admin for scoring.
