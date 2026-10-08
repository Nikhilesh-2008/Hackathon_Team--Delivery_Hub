# HackHub — Complete Database Schema & Relations

This document details the MongoDB Atlas database models and relational structure.

```text
       ┌───────────────┐
       │     User      │
       └───────┬───────┘
               │ 1:1
       ┌───────▼───────┐
       │    Profile    │
       └───────────────┘

       ┌───────────────┐
       │     Event     │ (Hackathon)
       └───────┬───────┘
               │ 1:N
       ┌───────▼───────┐
       │   Challenge   │ (Embedded sub-documents)
       └───────┬───────┘
               │ 1:N
       ┌───────▼───────┐
       │     Team      │ ◄────────────┐
       └───────┬───────┘              │
               │                      │
       ┌───────┴──────────────────────┴───────┐
       │               │                      │
┌──────▼──────┐ ┌──────▼──────┐        ┌──────▼──────┐
│ TeamMember  │ │    Task     │        │ Submission  │
└─────────────┘ └─────────────┘        └──────┬──────┘
                                              │
                                       ┌──────┴──────┐
                                       │             │
                                ┌──────▼──────┐ ┌────▼────────┐
                                │ MentorReview│ │ JudgeScore  │
                                └─────────────┘ └─────────────┘
```

---

## 1. Collections & Fields

### `users`
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique, Indexed)
- `passwordHash`: String (bcrypt)
- `role`: Enum (`Participant`, `Mentor`, `Judge`, `Organizer`, `Admin`)
- `avatar`: String
- `isVerified`: Boolean
- `createdAt`, `updatedAt`: Timestamp

### `profiles`
- `_id`: ObjectId
- `user`: ObjectId -> `users` (Unique reference)
- `bio`, `specialization`, `college`, `year`: String
- `skills`: Array of String
- `interests`: Array of String
- `availability`: String
- `codingProfiles`: Object `{ github, leetcode, codechef, codeforces }`
- `projects`: Array of `{ title, description, techStack, githubUrl, liveUrl }`
- `reputationScore`: Number (Default: 100)
- `visibility`: Boolean

### `events`
- `_id`: ObjectId
- `title`, `organizer`, `description`, `location`: String
- `tags`: Array of String
- `category`: String (`AI`, `Web`, `Cybersecurity`, `IoT`, `Open Innovation`)
- `status`: Enum (`Active`, `Upcoming`, `Completed`)
- `prizePool`, `teamSize`, `startDate`, `endDate`: String
- `rules`: Array of `{ section, title, text }`
- `judgingCriteria`: Array of `{ criteria, weight, desc }`
- `challenges`: Array of Challenge sub-documents

### `teams`
- `_id`: ObjectId
- `name`: String
- `event`: ObjectId -> `events`
- `captain`: ObjectId -> `users`
- `progress`: Number (0-100, auto-computed from closed sprint tasks)
- `members`: Array of `{ user, name, role, specialization, isCaptain, availability, taskCount }`
- `technicalDecisions`: Array of `{ title, author, date, status }`
- `chatMessages`: Array of `{ senderId, senderName, text, timestamp }`

### `tasks`
- `_id`: ObjectId
- `team`: ObjectId -> `teams`
- `title`, `owner`, `deadline`, `tag`, `description`: String
- `priority`: Enum (`High`, `Medium`, `Low`)
- `status`: Enum (`TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`)

### `teaminvitations`
- `_id`: ObjectId
- `sender`: ObjectId -> `users`
- `receiver`: ObjectId -> `users`
- `team`: ObjectId -> `teams`
- `message`: String
- `status`: Enum (`PENDING`, `ACCEPTED`, `REJECTED`)

### `submissions`
- `_id`: ObjectId
- `team`: ObjectId -> `teams` (Unique)
- `githubUrl`, `liveUrl`, `demoVideoUrl`, `presentationUrl`, `description`: String
- `checklist`: Object `{ githubRepo, deploymentLink, projectDescription, presentationDeck, demoVideo, finalTesting }`
- `status`: Enum (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `EVALUATED`)
- `submittedAt`: Date

### `mentorfeedbacks`
- `_id`: ObjectId
- `team`: ObjectId -> `teams`
- `mentorName`, `mentorRole`, `title`, `comment`: String
- `rating`: Number
- `recommendations`: Array of String

### `judgescores`
- `_id`: ObjectId
- `submission`: ObjectId -> `submissions`
- `teamName`, `judgeName`, `remarks`: String
- `innovation`, `technical`, `ux`, `impact`: Number
- `totalScore`: Number (Sum calculated on backend)

### `reputations` & `notifications`
- Activity logs, reputation points history (`+1000`, `+150`, `+15`), and unread alert feeds.
