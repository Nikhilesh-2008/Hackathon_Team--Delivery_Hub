# HackHub — Complete API Contract & Specifications

This document defines the REST API contract between the HackHub React frontend and Express backend.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Auth**: None
- **Body**:
  ```json
  {
    "name": "Karthik",
    "email": "karthik.dev@college.edu",
    "password": "password123",
    "role": "Participant",
    "specialization": "Backend Developer"
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "jwt_token...",
    "data": { "_id": "...", "name": "Karthik", "email": "...", "role": "Participant" }
  }
  ```

### `POST /api/auth/login`
- **Auth**: None
- **Body**: `{ "email": "karthik.dev@college.edu", "password": "password123" }`
- **Response `200`**: Set HTTP-only Cookie + JWT token payload.

### `GET /api/auth/me`
- **Auth**: Bearer Token / Cookie
- **Response `200`**: Current user profile object.

---

## 2. Profiles (`/api/profiles`)

### `GET /api/profiles`
- **Auth**: Optional
- **Query Params**: `?specialization=&skill=&interest=&query=`
- **Response `200`**: Array of candidates with calculated matchmaking score & `whyThisPerson` explainability.

### `GET /api/profile/me` & `PUT /api/profile/me`
- **Auth**: Bearer Token
- **Body**: `{ bio, specialization, skills, interests, availability, projects }`

---

## 3. Events & Challenges (`/api/events`)

### `GET /api/events`
- **Auth**: None
- **Query Params**: `?category=AI&search=Intelligent`
- **Response `200`**: Array of hackathons with nested challenge tracks, rules, and judging criteria.

### `POST /api/events`
- **Auth**: Bearer Token (`Organizer` or `Admin` role)

---

## 4. Teams & Invitations (`/api/teams`)

### `GET /api/teams/my-team`
- **Auth**: Optional / Bearer Token
- **Response `200`**: Active team workspace object including sprint progress, members, technical decisions, and team chat.

### `POST /api/teams/invitations`
- **Auth**: None / Bearer Token
- **Body**: `{ "receiverId": "...", "receiverName": "...", "message": "..." }`

### `PATCH /api/teams/invitations/:id`
- **Body**: `{ "status": "ACCEPTED" }` or `{ "status": "REJECTED" }`

---

## 5. Tasks & Sprints (`/api/tasks`)

### `GET /api/tasks`
- **Query Params**: `?teamId=...`
- **Response `200`**: Array of tasks across `TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`.

### `POST /api/tasks`
- **Body**: `{ "title": "...", "owner": "...", "priority": "High", "deadline": "Tomorrow", "tag": "Backend" }`

### `PATCH /api/tasks/:id/status`
- **Body**: `{ "status": "COMPLETED" }`
- **Note**: Backend automatically recalculates and updates the associated Team's progress percentage.

---

## 6. Submissions & Evaluations (`/api`)

### `GET /api/submission` & `PUT /api/submission`
- **Body**: `{ githubUrl, liveUrl, demoVideoUrl, presentationUrl, checklist }`

### `POST /api/submission/submit`
- **Body**: `{ status: "SUBMITTED" }`

### `POST /api/scores`
- **Body**: `{ submissionId, teamName, innovation: 22, technical: 28, ux: 18, impact: 23, remarks }`
- **Note**: Total score (out of 100) is calculated and validated on the backend.

### `GET /api/feedback` & `POST /api/feedback`
- **Body**: `{ teamId, title, comment, rating, mentorName }`

### `GET /api/notifications` & `PATCH /api/notifications/read-all`
- **Response `200`**: Live user notifications feed.
