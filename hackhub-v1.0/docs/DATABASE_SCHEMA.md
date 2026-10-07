# HackHub — Database Schema Specification

**Document Version:** 1.0.0  
**Target Engine:** MongoDB 7.0+ (Atlas & Local)  
**ORM / ODM:** Mongoose 8.x (Node.js ESM)  
**Audience:** Backend Team (Members 2, 3, 4) & System Architects  

---

## 1. Architectural Principles

1. **MongoDB is the Source of Truth:** No client timestamp or computed UI state (e.g., "82% ready") is trusted. All authorization, deadline cutoffs, membership boundaries, and submission readiness states are validated and computed against MongoDB.
2. **Normalized Relations with References:** Users are never embedded as complete documents inside teams. Tasks are not embedded in users. Normalized `ObjectId` references (`ref: 'Model'`) with explicit foreign keys guarantee referential integrity and prevent document bloating.
3. **Membership as Authorization Primitive:** `Membership` is a dedicated first-class collection. Access to private team workspaces, tasks, submissions, and chats requires an active membership record or authorized staff role (`ORGANIZER`, assigned `MENTOR`, assigned `JUDGE`).
4. **Optimistic Concurrency Control:** Write-intensive collaborative documents like `Task` and `Submission` maintain version keys (`version`, `revision`) to prevent lost updates when teammates edit concurrently.
5. **Strict Data Validation:** Schemas enforce field types, regular expressions, numeric boundaries (e.g., percentages 0–100), enumerated status values, and cross-field constraints.
6. **Terminology Standard:** The core hackathon collection is modeled as `Event` (collection `events`). For backward and developer convenience, `Hackathon` is exported as an alias, and `hackathonId` is supported alongside `eventId` across dependent models.

---

## 2. Collection Index

| # | Model Name | Collection Name | Domain Tier | Primary Responsibility |
|---|------------|-----------------|-------------|------------------------|
| 1 | **User** | `users` | MVP / Core | Core identity, authentication credentials, system roles |
| 2 | **Profile** | `profiles` | MVP / Core | Skills, bio, availability, discovery consent, portfolios |
| 3 | **Event** (`Hackathon`) | `events` | MVP / Core | Hackathon details, official dates, mode, status |
| 4 | **Challenge** | `challenges` | MVP / Core | Event tracks, problem statements, technical requirements |
| 5 | **Team** | `teams` | MVP / Core | Squad registration under an event and challenge track |
| 6 | **Membership** | `memberships` | MVP / Core | User-to-team link, workspace authorization, roles |
| 7 | **JoinRequest** | `join_requests` | MVP / Core | Participant requests to join an existing team |
| 8 | **Invitation** | `invitations` | MVP / Core | Team and staff invitations sent to candidates |
| 9 | **Task** | `tasks` | MVP / Core | Sprint Kanban deliverables, assignees, deadlines, versions |
| 10 | **Milestone** | `milestones` | MVP / Core | High-level roadmap checkpoints with verifiable completion |
| 11 | **Rubric** | `rubrics` | MVP / Core | Versioned scoring criteria and evidence requirements |
| 12 | **Submission** | `submissions` | MVP / Core | Official deliverable URLs, evidence checklist, status |
| 13 | **Session** | `sessions` | Secondary | User authentication sessions and refresh token tracking |
| 14 | **Reputation** | `reputations` | Secondary | Immutable ledger of reputation point transactions |
| 15 | **Notification** | `notifications` | Secondary | In-app user alerts with polymorphic entity linkages |
| 16 | **Feedback** | `feedbacks` | Secondary | Mentor architectural notes, ratings, blocker flags |
| 17 | **Score** | `scores` | Secondary | Judge evaluations against versioned rubric criteria |
| 18 | **AuditLog** | `audit_logs` | Secondary | Tamper-evident ledger for administrative and agent actions |
| 19 | **Document** | `documents` | AI / RAG | Official hackathon rulebooks and uploaded PDF guides |
| 20 | **Chunk** | `chunks` | AI / RAG | Text chunks and vector embeddings for Atlas Vector Search |
| 21 | **AgentRun** | `agent_runs` | AI / RAG | AI Delivery Planning Agent proposals and tool executions |

---

## 3. Core Models (MVP)

### 3.1 User (`users`)
Stores core identity and credentials. Registration only allows `PARTICIPANT`. Elevated roles (`MENTOR`, `JUDGE`, `ORGANIZER`, `ADMIN`) must be explicitly provisioned or upgraded via authorized workflows.

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    required: true, 
    enum: ['PARTICIPANT', 'MENTOR', 'JUDGE', 'ORGANIZER', 'ADMIN'], 
    default: 'PARTICIPANT' 
  },
  avatarUrl: { type: String, trim: true, default: '' },
  college: { type: String, trim: true, default: '' },
  graduationYear: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ email: 1 }` (unique)
  - `{ role: 1 }`
  - `{ createdAt: -1 }`

---

### 3.2 Profile (`profiles`)
Extended candidate profile used for AI matchmaking, skill filtering, and public portfolio presentation.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true, index: true },
  bio: { type: String, maxlength: 1000, default: '' },
  specialization: { 
    type: String, 
    enum: [
      'Frontend Developer', 
      'Backend Developer', 
      'Full Stack Developer', 
      'UI/UX Designer', 
      'AI/ML Developer', 
      'DevOps Developer', 
      'Database Developer', 
      'Cybersecurity', 
      'IoT Developer', 
      'Generalist'
    ],
    default: 'Generalist'
  },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  experienceLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
    default: 'intermediate' 
  },
  availability: { type: String, default: '8-10 hrs/week' },
  discoveryConsent: { type: Boolean, default: true, index: true },
  codingProfiles: {
    github: { type: String, trim: true, match: /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i },
    leetcode: { type: String, trim: true },
    codechef: { type: String, trim: true },
    codeforces: { type: String, trim: true },
    portfolio: { type: String, trim: true }
  },
  projects: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true }
  }],
  certificates: [{
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String }
  }],
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ userId: 1 }` (unique)
  - `{ discoveryConsent: 1, specialization: 1 }` (compound for teammate search)
  - `{ skills: 1 }` (multikey for skill query matching)

---

### 3.3 Event / Hackathon (`events`)
Represents an organized hackathon. Organizers define timelines, categories, and deadlines. MongoDB is the single source of truth for `submissionDeadline`.

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  organizerId: { type: ObjectId, ref: 'User', required: true, index: true },
  organizerName: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  theme: { type: String, default: '' },
  categories: [{ type: String, trim: true }], // e.g. ['AI', 'Web', 'Cybersecurity', 'IoT']
  technologies: [{ type: String, trim: true }],
  mode: { type: String, enum: ['online', 'in-person', 'hybrid'], default: 'hybrid' },
  location: { type: String, required: true, trim: true },
  prizePool: { type: String, default: '₹0' },
  minTeamSize: { type: Number, required: true, min: 1, default: 2 },
  maxTeamSize: { type: Number, required: true, max: 10, default: 4 },
  registrationDeadline: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  submissionDeadline: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'published', 'active', 'closed', 'locked'], 
    default: 'draft',
    index: true
  },
  bannerGradient: { type: String, default: 'from-indigo-600 to-blue-700' },
  createdAt: Date,
  updatedAt: Date
}
```
- **Validation Rules:**
  - `minTeamSize <= maxTeamSize`
  - `startDate < endDate`
  - `registrationDeadline <= startDate`
  - `submissionDeadline <= endDate`
- **Indexes:**
  - `{ slug: 1 }` (unique)
  - `{ status: 1, startDate: 1 }`
  - `{ submissionDeadline: 1 }`
  - `{ organizerId: 1 }`

---

### 3.4 Challenge (`challenges`)
Specific track or problem statement belonging to an event.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
  track: { type: String, required: true, trim: true }, // e.g. "AI & Education"
  problemStatement: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  requirements: [{ type: String, trim: true }],
  technologies: [{ type: String, trim: true }],
  recommendedSkills: [{ type: String, trim: true }],
  maxScore: { type: Number, default: 100 },
  deadline: { type: Date },
  createdAt: Date,
  updatedAt: Date
}
```
- **Virtuals & Aliases:**
  - `hackathonId` aliases `eventId`
- **Indexes:**
  - `{ eventId: 1, category: 1 }`
  - `{ eventId: 1, title: 1 }`

---

### 3.5 Team (`teams`)
A collaborative squad registered for a specific hackathon and challenge.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  challengeId: { type: ObjectId, ref: 'Challenge', required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  description: { type: String, default: '', maxlength: 500 },
  createdBy: { type: ObjectId, ref: 'User', required: true, index: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['forming', 'active', 'submitted', 'disqualified', 'archived'], 
    default: 'forming',
    index: true
  },
  technicalDecisions: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Proposed', 'In Discussion', 'Approved', 'Rejected'], default: 'Approved' }
  }],
  createdAt: Date,
  updatedAt: Date
}
```
- **Virtuals & Aliases:**
  - `hackathonId` aliases `eventId`
- **Indexes:**
  - `{ eventId: 1, name: 1 }` (unique within event to prevent duplicate team names)
  - `{ eventId: 1, challengeId: 1 }`
  - `{ createdBy: 1 }`

---

### 3.6 Membership (`memberships`)
The critical junction collection. Establishes team workspace access, member roles, and responsibilities.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  role: { type: String, required: true, enum: ['captain', 'member'], default: 'member' },
  status: { type: String, required: true, enum: ['pending', 'active', 'removed'], default: 'active', index: true },
  responsibilities: [{ type: String, trim: true }],
  specialization: { type: String, trim: true, default: '' },
  joinedAt: { type: Date, default: Date.now },
  createdAt: Date,
  updatedAt: Date
}
```
- **Unique Constraint:**
  - `{ userId: 1, eventId: 1, status: 1 }`: Partial unique index where `status: 'active'`. A user can only be an active member of ONE team per event!
  - `{ userId: 1, teamId: 1 }`: Unique compound index preventing duplicate membership records in the same team.
- **Indexes:**
  - `{ teamId: 1, status: 1 }`
  - `{ userId: 1, status: 1 }`
  - `{ eventId: 1, userId: 1 }`

---

### 3.7 JoinRequest (`join_requests`)
Participant self-initiated request to join a team. Must be accepted by the team captain.

```javascript
{
  _id: ObjectId,
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  requesterId: { type: ObjectId, ref: 'User', required: true, index: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'], 
    default: 'pending',
    index: true
  },
  message: { type: String, trim: true, maxlength: 300, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```
- **Unique Constraint:**
  - Partial unique index `{ teamId: 1, requesterId: 1 }` where `status: 'pending'`. Prevents spamming duplicate pending requests.

---

### 3.8 Invitation (`invitations`)
Outbound team invitation sent by a team captain or staff invite from an organizer.

```javascript
{
  _id: ObjectId,
  inviterId: { type: ObjectId, ref: 'User', required: true, index: true },
  inviteeId: { type: ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', index: true }, // Optional for event staff invites
  role: { type: String, enum: ['captain', 'member', 'mentor', 'judge'], default: 'member' },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'], 
    default: 'pending',
    index: true 
  },
  message: { type: String, trim: true, maxlength: 300, default: '' },
  tokenHash: { type: String, select: false }, // Never store raw tokens
  expiresAt: { type: Date, required: true },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ inviteeId: 1, status: 1 }`
  - `{ teamId: 1, inviteeId: 1, status: 1 }`
  - `{ expiresAt: 1 }` (TTL cleanup optional)

---

### 3.9 Task (`tasks`)
Kanban board task item for team deliverables. Features optimistic locking via `version`.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  ownerId: { type: ObjectId, ref: 'User', index: true }, // Optional if unassigned
  ownerName: { type: String, trim: true, default: 'Unassigned' },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  status: { 
    type: String, 
    required: true, 
    enum: ['todo', 'in_progress', 'blocked', 'done'], 
    default: 'todo',
    index: true
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  tag: { type: String, trim: true, default: 'General' }, // e.g. Frontend, Backend, AI/RAG
  targetDate: { type: Date, index: true },
  version: { type: Number, required: true, default: 1 },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  createdAt: Date,
  updatedAt: Date
}
```
- **Optimistic Concurrency Control:** Every update must include `{ _id, version: currentVersion }` and execute `$inc: { version: 1 }`.
- **Indexes:**
  - `{ teamId: 1, status: 1 }`
  - `{ teamId: 1, ownerId: 1 }`
  - `{ eventId: 1, status: 1 }`
  - `{ teamId: 1, targetDate: 1 }`

---

### 3.10 Milestone (`milestones`)
High-level sprint milestone checkpoint.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'in_progress', 'completed', 'missed'], 
    default: 'pending' 
  },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ teamId: 1, dueDate: 1 }`
  - `{ eventId: 1, teamId: 1 }`

---

### 3.11 Rubric (`rubrics`)
Jury evaluation criteria and weights. Versions are immutable once used by submissions or scores.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  version: { type: Number, required: true, min: 1, default: 1 },
  criteria: [{
    criterionId: { type: String, required: true }, // e.g. "crit_innovation"
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    maxScore: { type: Number, required: true, min: 1 },
    weightPercentage: { type: Number, required: true, min: 1, max: 100 },
    requiredEvidence: { type: String, default: '' } // e.g. "Public GitHub README, live link"
  }],
  totalMaxScore: { type: Number, required: true, default: 100 },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: Date,
  updatedAt: Date
}
```
- **Validation Rules:** Sum of `criteria[].maxScore` must equal `totalMaxScore` (typically 100).
- **Indexes:**
  - `{ eventId: 1, version: 1 }` (unique)
  - `{ eventId: 1, isActive: 1 }`

---

### 3.12 Submission (`submissions`)
Final hackathon deliverables submitted by a team. Official deadline and organizer locks are checked in MongoDB before any modification.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, unique: true, index: true },
  challengeId: { type: ObjectId, ref: 'Challenge', required: true, index: true },
  rubricVersion: { type: Number, required: true, default: 1 },
  description: { type: String, required: true, trim: true, minlength: 10 },
  repositoryUrl: { 
    type: String, 
    required: true, 
    trim: true, 
    match: /^https?:\/\/(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/.+$/i 
  },
  deploymentUrl: { 
    type: String, 
    required: true, 
    trim: true, 
    match: /^https?:\/\/.+$/i 
  },
  demoVideoUrl: { type: String, trim: true, default: '' },
  presentationUrl: { type: String, trim: true, default: '' },
  evidence: [{
    criterionId: { type: String, required: true },
    type: { type: String, enum: ['githubRepo', 'deploymentLink', 'demoVideo', 'presentationDeck', 'documentation'], required: true },
    url: { type: String, required: true, trim: true },
    notes: { type: String, default: '' }
  }],
  checklist: {
    githubRepo: { type: Boolean, default: false },
    deploymentLink: { type: Boolean, default: false },
    projectDescription: { type: Boolean, default: false },
    presentationDeck: { type: Boolean, default: false },
    demoVideo: { type: Boolean, default: false },
    finalTesting: { type: Boolean, default: false }
  },
  readinessPercentage: { type: Number, min: 0, max: 100, default: 0 },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'submitted', 'locked'], 
    default: 'draft',
    index: true
  },
  revision: { type: Number, required: true, default: 1 },
  submittedAt: { type: Date },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ teamId: 1 }` (unique)
  - `{ eventId: 1, status: 1 }`
  - `{ challengeId: 1, status: 1 }`

---

## 4. Secondary Models

### 4.1 Session (`sessions`)
Tracks active JWT refresh sessions or API tokens for revoked authorization management.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  isValid: { type: Boolean, default: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto TTL purge
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4.2 Reputation (`reputations`)
Append-only ledger of earned and deducted reputation points. Current total is computed as sum of `points`.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: ObjectId, ref: 'Event', index: true },
  points: { type: Number, required: true }, // Can be positive or negative
  type: { 
    type: String, 
    required: true, 
    enum: ['PLACEMENT', 'PARTICIPATION', 'TASK_COMPLETION', 'PEER_REVIEW', 'MENTOR_BONUS', 'PENALTY'] 
  },
  reason: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now, index: true }
}
```
- **Indexes:**
  - `{ userId: 1, createdAt: -1 }`
  - `{ userId: 1, eventId: 1 }`

---

### 4.3 Notification (`notifications`)
In-app alerts for team invitations, mentor feedback, scoring updates, and deadline reminders.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['team', 'deadline', 'feedback', 'reputation', 'event', 'system'] 
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  relatedEntity: { type: String, enum: ['Team', 'Event', 'Task', 'Submission', 'Feedback', 'Score'] },
  relatedEntityId: { type: ObjectId },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}
```
- **Indexes:**
  - `{ userId: 1, isRead: 1, createdAt: -1 }`

---

### 4.4 Feedback (`feedbacks`)
Structured architectural and design feedback posted by assigned mentors.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  mentorId: { type: ObjectId, ref: 'User', required: true, index: true },
  mentorName: { type: String, required: true },
  mentorRole: { type: String, default: 'Faculty Mentor' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  message: { type: String, required: true, trim: true },
  blocker: { type: String, default: '' },
  recommendations: [{ type: String, trim: true }],
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ teamId: 1, createdAt: -1 }`
  - `{ eventId: 1, mentorId: 1 }`

---

### 4.5 Score (`scores`)
Official scores submitted by judges against the event's rubric criteria.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  submissionId: { type: ObjectId, ref: 'Submission', required: true, index: true },
  judgeId: { type: ObjectId, ref: 'User', required: true, index: true },
  judgeName: { type: String, required: true },
  rubricVersion: { type: Number, required: true },
  criteriaScores: [{
    criterionId: { type: String, required: true },
    criterionName: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    comment: { type: String, default: '' }
  }],
  totalScore: { type: Number, required: true, min: 0, max: 100 },
  comments: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```
- **Unique Constraint:** `{ submissionId: 1, judgeId: 1 }`: A judge may only score a submission once.
- **Business Rule:** Judge cannot score a submission from a team where they have any active membership!

---

### 4.6 AuditLog (`audit_logs`)
Immutable audit log recording sensitive actions: organizer overrides, deadline updates, submission locks, agent plan confirmations.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', index: true },
  actorId: { type: ObjectId, ref: 'User', required: true, index: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, trim: true }, // e.g. "SUBMISSION_LOCKED", "AGENT_PROPOSAL_APPROVED"
  entityType: { type: String, required: true }, // e.g. "Submission", "Task", "Event"
  entityId: { type: ObjectId, required: true, index: true },
  reason: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
}
```

---

## 5. AI / RAG Models

### 5.1 Document (`documents`)
Ingested rulebooks, guidelines, and PDF resources for Atlas Vector Search ingestion.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  title: { type: String, required: true, trim: true },
  version: { type: String, required: true, default: '1.0' },
  sourceType: { type: String, enum: ['pdf', 'markdown', 'webpage', 'text'], default: 'pdf' },
  sourceUrl: { type: String, trim: true },
  fileSize: { type: Number },
  status: { 
    type: String, 
    required: true, 
    enum: ['uploaded', 'extracting', 'embedding', 'ready', 'failed'], 
    default: 'uploaded',
    index: true 
  },
  uploadedBy: { type: ObjectId, ref: 'User', required: true },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes:**
  - `{ eventId: 1, version: 1 }`
  - `{ eventId: 1, status: 1 }`

---

### 5.2 Chunk (`chunks`)
Chunked text passages and vector embeddings for Atlas Vector Search.

```javascript
{
  _id: ObjectId,
  documentId: { type: ObjectId, ref: 'Document', required: true, index: true },
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  version: { type: String, required: true, default: '1.0' },
  teamId: { type: ObjectId, ref: 'Team', index: true }, // Optional team scope for private documents
  page: { type: Number, default: 1 },
  section: { type: String, default: 'General' }, // e.g. "3.0 Technology Restrictions"
  text: { type: String, required: true },
  embedding: { type: [Number], default: [] }, // 768 or 1536 dim float vector
  embeddingModel: { type: String, default: 'text-embedding-004' },
  embeddingVersion: { type: String, default: '1' },
  createdAt: { type: Date, default: Date.now }
}
```
- **Atlas Vector Search Index Definition (MongoDB Atlas UI / CLI):**
  ```json
  {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 768,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "eventId"
      },
      {
        "type": "filter",
        "path": "version"
      }
    ]
  }
  ```
- **B-Tree Indexes:**
  - `{ eventId: 1, documentId: 1 }`
  - `{ eventId: 1, version: 1 }`

---

### 5.3 AgentRun (`agent_runs`)
Records AI Delivery Planning agent runs, questions, tool executions, and proposals. Captain approval is mandatory before modifying team state.

```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team', required: true, index: true },
  requestedBy: { type: ObjectId, ref: 'User', required: true, index: true },
  question: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'analyzing', 'proposed', 'approved', 'rejected', 'failed'], 
    default: 'proposed',
    index: true 
  },
  toolsUsed: [{ type: String }],
  proposal: {
    canFinishBeforeDeadline: { type: Boolean, default: true },
    confidencePercentage: { type: Number, min: 0, max: 100, default: 85 },
    assessment: { type: String, default: '' },
    criticalBlocker: { type: String, default: '' },
    recommendations: [{ type: String }],
    proposedSchedule: [{
      time: { type: String, required: true },
      task: { type: String, required: true }
    }]
  },
  approvedBy: { type: ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}
```
- **Indexes:**
  - `{ teamId: 1, createdAt: -1 }`
  - `{ eventId: 1, status: 1 }`
