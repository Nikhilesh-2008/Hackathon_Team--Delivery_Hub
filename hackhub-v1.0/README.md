# HackHub v1.0

HackHub helps students discover hackathons, find teammates, coordinate project work, and submit deliverables. This folder is the v1 application and canonical backend workspace.

## Stack

- Frontend: React 19, React Router, Vite, Tailwind CSS
- API: Node.js, Express, JSON REST endpoints under `/api`
- Database: MongoDB with Mongoose models in `server/models/`
- Authentication: bcrypt password hashing, JWT access token, and persisted sessions

## Run locally

1. Install the v1 dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `JWT_SECRET` to a private random value. Set `MONGODB_URI` to your local MongoDB or team database. Never commit `.env`.

3. Start the MongoDB service, then start the API in one terminal:

   ```bash
   npm run server
   ```

   The API listens at `http://localhost:5000/api`; check `http://localhost:5000/api/health` for its database status.

4. Start the frontend in a second terminal:

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. Vite proxies `/api` requests to the API server, and users enter through `/login` or `/register`.

## Backend architecture

`server/routes/routeRegistry.js` and `docs/API_ROUTES.md` define the existing canonical route contracts. Express route modules mount those paths; controllers translate HTTP requests; services enforce business rules; Mongoose models persist data. Preserve the established paths and JSON response envelope (`success`, `data`, `error`) when extending the API.

The schema and most route/controller/service files are already present. The frontend is being connected to the real API in feature slices. Authentication, event discovery, profile discovery, and team task/submission workflows are the current integration scope. Mentor, judge, organizer, notification, reputation, document/RAG, and AI planner screens still require end-to-end integration with their existing APIs and external services.

## Existing project checks

```bash
npm run db:verify
npm run api:verify
```

These inspect model and route registration. They require the project dependencies to be installed. Seeding is available through `npm run db:seed`; review the seed script and point `MONGODB_URI` at a development database before running it.
