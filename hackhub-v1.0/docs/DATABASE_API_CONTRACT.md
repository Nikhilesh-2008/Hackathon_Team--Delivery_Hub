# HackHub — Shared Backend Database API Contract

**Document Version:** 1.0.0  
**Target:** API Developers (Members 2, 3, 4) & Integration Engineers  
**Specification:** RESTful JSON API backed by MongoDB Mongoose Models  

---

## 1. Authentication & Session Management

### 1.1 Register New Participant
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Collections Touched:** `users`, `profiles`, `audit_logs`
- **Request Body:**
  ```json
  {
    "name": "Karthik",
    "email": "karthik.dev@college.edu",
    "password": "StrongPassword#123",
    "college": "National Institute of Technology",
    "graduationYear": "3rd Year, B.Tech CSE"
  }
  ```
- **Validation & Business Rules:**
  - Role defaults strictly to `PARTICIPANT`. Requests attempting to supply `role: 'ORGANIZER'` or `ADMIN` must return `403 Forbidden`.
  - Checks if `User.findOne({ email })` exists (return `409 Conflict`).
  - Hashes password using bcrypt (salt rounds: 12) into `passwordHash`.
  - Automatically initializes empty `Profile` document with `{ userId: user._id, discoveryConsent: true }`.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "user": {
      "id": "67039a00b1a2c3d4e5f60001",
      "name": "Karthik",
      "email": "karthik.dev@college.edu",
      "role": "PARTICIPANT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Collections Touched:** `users`, `sessions`
- **Request Body:**
  ```json
  {
    "email": "karthik.dev@college.edu",
    "password": "StrongPassword#123"
  }
  ```
- **Validation & Business Rules:**
  - `User.findOne({ email }).select('+passwordHash')`.
  - Verify bcrypt hash. If invalid, return `401 Unauthorized`.
  - Create `Session` document with hashed refresh token and 7-day expiration.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "67039a00b1a2c3d4e5f60001",
      "name": "Karthik",
      "email": "karthik.dev@college.edu",
      "role": "PARTICIPANT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "ref_98a7sdf8a7sd8f7a"
  }
  ```

---

### 1.3 Get Current User Profile & Context
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (`Bearer <token>`)
- **Collections Touched:** `users`, `profiles`, `memberships`, `reputations`
- **Query Operations:**
  - `User.findById(req.user.id)`
  - `Profile.findOne({ userId: req.user.id })`
  - `Membership.find({ userId: req.user.id, status: 'active' }).populate('teamId')`
  - Compute `totalReputation`: `Reputation.aggregate([ { $match: { userId } }, { $group: { _id: null, total: { $sum: '$points' } } } ])`
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "67039a00b1a2c3d4e5f60001",
      "name": "Karthik",
      "email": "karthik.dev@college.edu",
      "role": "PARTICIPANT",
      "college": "National Institute of Technology",
      "avatarUrl": ""
    },
    "profile": {
      "specialization": "Backend Developer",
      "skills": ["Node.js", "MongoDB", "Express", "Python"],
      "availability": "8-10 hours/week",
      "discoveryConsent": true
    },
    "reputation": 1250,
    "activeTeams": [
      {
        "teamId": "67039a00b1a2c3d4e5f60020",
        "teamName": "Team Nova",
        "eventId": "67039a00b1a2c3d4e5f60010",
        "role": "captain"
      }
    ]
  }
  ```

---

### 1.4 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated
- **Collections Touched:** `sessions`
- **Request Body:** `{ "refreshToken": "ref_98a7sdf8a7sd8f7a" }`
- **Query:** `Session.findOneAndUpdate({ tokenHash }, { isValid: false })`
- **Response (200 OK):** `{ "success": true, "message": "Session invalidated" }`

---

## 2. Events & Challenges

### 2.1 List All Hackathons
- **Endpoint:** `GET /api/events`
- **Access:** Public
- **Collections Touched:** `events`, `challenges`
- **Query Parameters:**
  - `category` (optional, e.g., `AI`, `Web`, `Cybersecurity`)
  - `status` (optional, default `active`, `published`)
  - `search` (optional string)
- **Database Query:**
  ```javascript
  const filter = { status: { $in: ['published', 'active'] } };
  if (category) filter.categories = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const events = await Event.find(filter).sort({ startDate: 1 });
  ```
- **Response (200 OK):** Array of Event summaries with track badges and deadlines.

---

### 2.2 Get Hackathon Details
- **Endpoint:** `GET /api/events/:eventId`
- **Access:** Public
- **Collections Touched:** `events`, `challenges`, `rubrics`
- **Query Operations:**
  - `Event.findById(eventId)`
  - `Challenge.find({ eventId })`
  - `Rubric.findOne({ eventId, isActive: true })`
- **Response (200 OK):**
  ```json
  {
    "event": {
      "_id": "67039a00b1a2c3d4e5f60010",
      "name": "NexusHack 2026: AI & Intelligent Systems",
      "slug": "nexushack-2026",
      "status": "active",
      "startDate": "2026-10-12T00:00:00.000Z",
      "endDate": "2026-10-14T23:59:59.000Z",
      "submissionDeadline": "2026-10-14T23:59:00.000Z",
      "prizePool": "₹2,50,000",
      "minTeamSize": 2,
      "maxTeamSize": 4
    },
    "challenges": [
      {
        "_id": "67039a00b1a2c3d4e5f60015",
        "title": "Intelligent Adaptive Study Engine",
        "track": "AI & Education",
        "problemStatement": "College students struggle with unstructured textbook PDFs...",
        "requirements": ["Interactive student dashboard", "Automated question generator"],
        "recommendedSkills": ["React", "Node.js", "Python", "MongoDB"]
      }
    ],
    "rubric": {
      "version": 1,
      "totalMaxScore": 100,
      "criteria": [
        { "criterionId": "crit_innovation", "name": "Innovation & Novelty", "maxScore": 25, "weightPercentage": 25 },
        { "criterionId": "crit_tech_execution", "name": "Technical Architecture", "maxScore": 30, "weightPercentage": 30 },
        { "criterionId": "crit_ui_ux", "name": "UI/UX & Polish", "maxScore": 20, "weightPercentage": 20 },
        { "criterionId": "crit_impact", "name": "Impact & Feasibility", "maxScore": 25, "weightPercentage": 25 }
      ]
    }
  }
  ```

---

## 3. Profiles & Teammate Discovery

### 3.1 Get & Update Current Profile
- **Endpoint:** `GET /api/profiles/me` | `PATCH /api/profiles/me`
- **Access:** Authenticated
- **Collections Touched:** `profiles`
- **Patch Request Body:**
  ```json
  {
    "bio": "Pre-final year CS student passionate about distributed systems.",
    "specialization": "Backend Developer",
    "skills": ["Node.js", "MongoDB", "Express", "Python", "Redis"],
    "interests": ["AI", "Hackathons", "Web Development"],
    "availability": "8-10 hours/week",
    "discoveryConsent": true
  }
  ```
- **Business Rule:** If `discoveryConsent: false`, the user must be excluded from `/api/discovery/teammates`.

---

### 3.2 Discover Teammates
- **Endpoint:** `POST /api/discovery/teammates`
- **Access:** Authenticated
- **Collections Touched:** `profiles`, `users`, `reputations`
- **Request Body:**
  ```json
  {
    "eventId": "67039a00b1a2c3d4e5f60010",
    "specialization": "Frontend Developer",
    "skill": "React",
    "query": "React Tailwind UI specialist"
  }
  ```
- **Database Query:**
  ```javascript
  const filter = { discoveryConsent: true };
  if (specialization && specialization !== 'All') filter.specialization = specialization;
  if (skill && skill !== 'All') filter.skills = skill;
  const profiles = await Profile.find(filter)
    .populate('userId', 'name email college avatarUrl')
    .limit(20);
  ```
- **Response (200 OK):** Filtered candidate cards with `whyThisPerson` compatibility reasoning.

---

## 4. Teams & Membership Lifecycle

### 4.1 Create Team
- **Endpoint:** `POST /api/teams`
- **Access:** Authenticated (`PARTICIPANT`)
- **Collections Touched:** `teams`, `memberships`, `events`, `audit_logs`
- **Request Body:**
  ```json
  {
    "eventId": "67039a00b1a2c3d4e5f60010",
    "challengeId": "67039a00b1a2c3d4e5f60015",
    "name": "Team Nova",
    "description": "Building an AI-driven adaptive syllabus roadmap."
  }
  ```
- **Validation & Business Rules:**
  - Verify `Event.findById(eventId)` is open and `registrationDeadline` has not passed.
  - Check partial unique index: Has user already joined an active team for this event? `Membership.findOne({ userId, eventId, status: 'active' })` -> if exists, return `409 Conflict ("User is already in an active team for this hackathon")`.
  - Check team name uniqueness within event: `Team.findOne({ eventId, name })`.
  - Transaction:
    1. Create `Team` with `createdBy: userId`.
    2. Create `Membership` with `{ userId, teamId: team._id, eventId, role: 'captain', status: 'active' }`.
- **Response (201 Created):** Full team object with captain membership.

---

### 4.2 Get Team Workspace
- **Endpoint:** `GET /api/teams/:teamId`
- **Access:** Team members (`Membership.status == 'active'`) OR Event Staff
- **Collections Touched:** `teams`, `memberships`, `tasks`, `submissions`, `challenges`
- **Authorization Check:**
  ```javascript
  const membership = await Membership.findOne({ 
    userId: req.user.id, 
    teamId, 
    status: 'active' 
  });
  if (!membership && !['ORGANIZER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied to private workspace" });
  }
  ```
- **Response (200 OK):** Team details, member list with roles, progress %, technical decisions.

---

### 4.3 Submit Join Request
- **Endpoint:** `POST /api/teams/:teamId/join-requests`
- **Access:** Authenticated
- **Collections Touched:** `join_requests`, `teams`, `notifications`
- **Request Body:**
  ```json
  {
    "message": "Hey! I am a React frontend dev with UI design experience."
  }
  ```
- **Validation Rules:**
  - Verify user is not already an active member of this or another team in the same event.
  - Check duplicate pending request: `JoinRequest.findOne({ teamId, requesterId, status: 'pending' })` -> if exists, return `409 Conflict`.
  - Create `JoinRequest` and send notification to team captain.

---

## 5. Sprint Tasks & Milestones

### 5.1 Get Team Tasks (Kanban)
- **Endpoint:** `GET /api/teams/:teamId/tasks`
- **Access:** Team members & Mentors
- **Collections Touched:** `tasks`
- **Database Query:** `Task.find({ teamId }).sort({ targetDate: 1 })`
- **Response (200 OK):** Grouped or flat array of tasks by status (`todo`, `in_progress`, `blocked`, `done`).

---

### 5.2 Create Sprint Task
- **Endpoint:** `POST /api/teams/:teamId/tasks`
- **Access:** Team members
- **Collections Touched:** `tasks`, `teams`
- **Request Body:**
  ```json
  {
    "title": "Create REST API for Topic Quiz Generation",
    "description": "Express routes for creating customized diagnostic tests.",
    "ownerId": "67039a00b1a2c3d4e5f60001",
    "ownerName": "Karthik",
    "priority": "high",
    "tag": "Backend",
    "targetDate": "2026-10-13T18:00:00.000Z"
  }
  ```
- **Response (201 Created):** Created Task object with `version: 1`.

---

### 5.3 Update Task Status (Optimistic Locking)
- **Endpoint:** `PATCH /api/tasks/:taskId`
- **Access:** Team members
- **Collections Touched:** `tasks`
- **Request Body:**
  ```json
  {
    "status": "done",
    "version": 1
  }
  ```
- **Optimistic Locking Query:**
  ```javascript
  const task = await Task.findOneAndUpdate(
    { _id: taskId, version: req.body.version },
    { $set: { status: req.body.status }, $inc: { version: 1 } },
    { new: true }
  );
  if (!task) {
    return res.status(409).json({ error: "Conflict: Task was modified by another teammate. Please refresh." });
  }
  ```

---

## 6. Project Submissions & Readiness

### 6.1 Get Team Submission Checklist & Readiness
- **Endpoint:** `GET /api/teams/:teamId/checklist`
- **Access:** Team members & Jurors
- **Collections Touched:** `submissions`, `events`
- **Computation:**
  - Backend evaluates actual deliverable URLs in `Submission` (`repositoryUrl`, `deploymentUrl`, `demoVideoUrl`, `presentationUrl`) and checklist flags.
  - Computes `readinessPercentage = (completedItems / totalItems) * 100`.
  - Compares current server time `Date.now()` with `Event.submissionDeadline`.
- **Response (200 OK):**
  ```json
  {
    "teamId": "67039a00b1a2c3d4e5f60020",
    "readinessPercentage": 83,
    "isDeadlinePassed": false,
    "deadline": "2026-10-14T23:59:00.000Z",
    "checklist": {
      "githubRepo": true,
      "deploymentLink": true,
      "projectDescription": true,
      "presentationDeck": true,
      "demoVideo": false,
      "finalTesting": true
    }
  }
  ```

---

### 6.2 Save Draft or Submit Project
- **Endpoint:** `POST /api/teams/:teamId/submission`
- **Access:** Team Captain (`role: 'captain'`)
- **Collections Touched:** `submissions`, `events`, `audit_logs`
- **Request Body:**
  ```json
  {
    "repositoryUrl": "https://github.com/karthik-dev/ai-study-planner",
    "deploymentUrl": "https://study-planner-demo.vercel.app",
    "demoVideoUrl": "https://youtube.com/watch?v=demo-karthik",
    "presentationUrl": "https://docs.google.com/presentation/d/mock-slides",
    "description": "Intelligent adaptive syllabus roadmap and automated quiz diagnostic platform.",
    "action": "SUBMIT" // "SAVE_DRAFT" or "SUBMIT"
  }
  ```
- **Validation & Deadline Enforcement:**
  1. Fetch `Event` for the team.
  2. If `Date.now() > event.submissionDeadline` or `event.status === 'locked'`: Return `403 Forbidden ("Submission window has closed.")`.
  3. Validate valid URL regex patterns.
  4. If `action === 'SUBMIT'`: Set `status: 'submitted'`, `submittedAt: new Date()`, increment `revision`.
  5. Audit log entry recorded.
- **Response (200 OK):** Updated Submission document with verified status.

---

## 7. Mentor Guidance & Feedback

### 7.1 Post Mentor Feedback
- **Endpoint:** `POST /api/teams/:teamId/feedback`
- **Access:** Assigned Mentors (`role: 'MENTOR'` or staff)
- **Collections Touched:** `feedbacks`, `notifications`
- **Request Body:**
  ```json
  {
    "title": "Promising RAG Flow, Watch Out for Vector Search Latency",
    "message": "The syllabus ingestion pipeline is well-structured. Make sure you cache questions in Redis so judges do not experience model lag.",
    "rating": 4.5,
    "blocker": "Staging Render CORS setup",
    "recommendations": ["Cache diagnostic quiz queries", "Test mobile viewport"]
  }
  ```
- **Response (201 Created):** Created Feedback record, triggers in-app notification to all active team members.

---

## 8. Jury Evaluation & Scoring

### 8.1 Submit Judge Evaluation
- **Endpoint:** `POST /api/submissions/:submissionId/scores`
- **Access:** Authorized Judges (`role: 'JUDGE'`)
- **Collections Touched:** `scores`, `submissions`, `rubrics`, `memberships`
- **Request Body:**
  ```json
  {
    "rubricVersion": 1,
    "criteriaScores": [
      { "criterionId": "crit_innovation", "criterionName": "Innovation & Novelty", "score": 22, "maxScore": 25 },
      { "criterionId": "crit_tech_execution", "criterionName": "Technical Architecture", "score": 28, "maxScore": 30 },
      { "criterionId": "crit_ui_ux", "criterionName": "UI/UX Polish", "score": 18, "maxScore": 20 },
      { "criterionId": "crit_impact", "criterionName": "Impact & Feasibility", "score": 23, "maxScore": 25 }
    ],
    "comments": "Superb architecture and crisp live demo. Very realistic college problem statement."
  }
  ```
- **Authorization & Conflict Rules:**
  - Verify requesting user has `role: 'JUDGE'`.
  - Check for Conflict of Interest: Judge must **not** be a member of the team whose submission is being scored (`Membership.findOne({ userId: judgeId, teamId: submission.teamId, status: 'active' })` -> if exists, return `403 Forbidden`).
  - Total score computed as `sum(criteriaScores[].score)` (must equal 91/100).
  - Enforce unique index `{ submissionId, judgeId }`. If judge already evaluated, return `409 Conflict ("Evaluation already recorded.")`.
- **Response (201 Created):** Score document recorded.
