import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import {
  User,
  Profile,
  Event,
  Challenge,
  Team,
  Membership,
  JoinRequest,
  Task,
  Submission,
  Score,
  Feedback,
  Document,
  Chunk,
  AgentRun,
  AuditLog,
  Rubric,
} from '../models/index.js';
import { hashPassword, generateAuthToken } from '../utils/auth.js';

let mongod;

const runTests = async () => {
  console.log('====================================================');
  console.log('HACKHUB COMPLETE API ACCEPTANCE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testAssert = (cond, name) => {
    if (cond) {
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name}`);
      failed++;
    }
  };

  // 1. Initialize In-Memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('Connected to In-Memory MongoDB for Acceptance Suite.\n');

  try {
    // ----------------------------------------------------
    // Seed prerequisite actors
    // ----------------------------------------------------
    const defaultPasswordHash = await hashPassword('Password#123');

    const organizer = await User.create({
      name: 'Organizer Aakash',
      email: 'aakash.org@hackhub.com',
      passwordHash: defaultPasswordHash,
      role: 'ORGANIZER',
      isActive: true,
      emailVerified: true,
    });
    const organizerToken = generateAuthToken(organizer);

    const mentor = await User.create({
      name: 'Dr. Arvind Rao',
      email: 'arvind.mentor@hackhub.com',
      passwordHash: defaultPasswordHash,
      role: 'MENTOR',
      isActive: true,
      emailVerified: true,
    });
    const mentorToken = generateAuthToken(mentor);

    const judge = await User.create({
      name: 'Judge Siddharth',
      email: 'siddharth.judge@hackhub.com',
      passwordHash: defaultPasswordHash,
      role: 'JUDGE',
      isActive: true,
      emailVerified: true,
    });
    const judgeToken = generateAuthToken(judge);

    const outsiderParticipant = await User.create({
      name: 'Outsider Participant',
      email: 'outsider@college.edu',
      passwordHash: defaultPasswordHash,
      role: 'PARTICIPANT',
      isActive: true,
      emailVerified: true,
    });
    const outsiderToken = generateAuthToken(outsiderParticipant);

    // ----------------------------------------------------
    // FLOW STEP 1: REGISTER
    // ----------------------------------------------------
    console.log('--- Step 1: User Registration ---');
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Karthik',
        email: 'karthik.dev@college.edu',
        password: 'StrongPassword#123',
        college: 'National Institute of Technology',
        graduationYear: '3rd Year, B.Tech CSE',
      });

    testAssert(registerRes.status === 201, 'POST /api/auth/register returns 201');
    testAssert(registerRes.body.success === true, 'Response format contains success: true');
    testAssert(registerRes.body.data.user.role === 'PARTICIPANT', 'User registered strictly as PARTICIPANT');
    const captainUser = registerRes.body.data.user;

    // ----------------------------------------------------
    // FLOW STEP 2: VERIFY EMAIL
    // ----------------------------------------------------
    console.log('\n--- Step 2: Email Verification ---');
    const verifyRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: 'karthik.dev@college.edu',
        token: 'mock-verify-token',
      });

    testAssert(verifyRes.status === 200, 'POST /api/auth/verify-email returns 200');
    testAssert(verifyRes.body.data.verified === true, 'Email successfully verified');

    // ----------------------------------------------------
    // FLOW STEP 3: LOGIN
    // ----------------------------------------------------
    console.log('\n--- Step 3: Login ---');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'karthik.dev@college.edu',
        password: 'StrongPassword#123',
      });

    testAssert(loginRes.status === 200, 'POST /api/auth/login returns 200');
    testAssert(!!loginRes.body.data.token, 'Auth token received on login');
    const captainToken = loginRes.body.data.token;

    // ----------------------------------------------------
    // FLOW STEP 4: GET /api/auth/me
    // ----------------------------------------------------
    console.log('\n--- Step 4: Current User Context ---');
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${captainToken}`);

    testAssert(meRes.status === 200, 'GET /api/auth/me returns 200');
    testAssert(meRes.body.data.user.email === 'karthik.dev@college.edu', 'User context matches authenticated user');
    testAssert(typeof meRes.body.data.reputation === 'number', 'Reputation total included in context');

    // ----------------------------------------------------
    // FLOW STEP 5 & 6: EVENTS
    // ----------------------------------------------------
    console.log('\n--- Step 5 & 6: Events Management & Discovery ---');
    const futureDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'NexusHack 2026',
        description: 'Next-generation hackathon',
        startDate: new Date(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        submissionDeadline: futureDeadline,
        location: 'Bangalore Tech Hub',
        categories: ['AI', 'Web'],
      });

    testAssert(eventRes.status === 201, 'POST /api/events creates draft event');
    const eventId = eventRes.body.data._id;

    // Publish event
    const publishRes = await request(app)
      .post(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizerToken}`);
    testAssert(publishRes.status === 200, 'POST /api/events/:eventId/publish publishes event');

    // Public list events
    const listEventsRes = await request(app).get('/api/events');
    testAssert(listEventsRes.status === 200, 'GET /api/events returns 200');
    testAssert(listEventsRes.body.data.length >= 1, 'Published event visible in public discovery');

    // Event details
    const eventDetailsRes = await request(app).get(`/api/events/${eventId}`);
    testAssert(eventDetailsRes.status === 200, 'GET /api/events/:eventId returns event details');

    // Add Challenge under event
    const challengeRes = await request(app)
      .post(`/api/events/${eventId}/challenges`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Adaptive Study Engine',
        track: 'AI & Education',
        problemStatement: 'Students struggle with unstructured notes',
        description: 'Build an AI study companion',
        category: 'AI',
        requirements: ['Web App', 'Vector Database'],
        recommendedSkills: ['React', 'Node.js', 'MongoDB'],
      });
    testAssert(challengeRes.status === 201, 'POST /api/events/:eventId/challenges creates challenge track');
    const challengeId = challengeRes.body.data._id;

    // List challenges
    const getChallengesRes = await request(app).get(`/api/events/${eventId}/challenges`);
    testAssert(getChallengesRes.status === 200, 'GET /api/events/:eventId/challenges lists event tracks');

    // ----------------------------------------------------
    // FLOW STEP 7: PROFILES & DISCOVERY
    // ----------------------------------------------------
    console.log('\n--- Step 7: Profiles & Discovery Consent ---');
    const profileRes = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', `Bearer ${captainToken}`);
    testAssert(profileRes.status === 200, 'GET /api/profiles/me returns profile');

    const updateProfileRes = await request(app)
      .patch('/api/profiles/me')
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        specialization: 'Backend Developer',
        skills: ['Node.js', 'MongoDB', 'Docker'],
        availability: '10 hrs/week',
        discoveryConsent: true,
      });
    testAssert(updateProfileRes.status === 200, 'PATCH /api/profiles/me updates profile');

    // Create a consenting candidate and a non-consenting candidate
    const candidateConsenting = await User.create({
      name: 'Consenting Dev',
      email: 'consenting@college.edu',
      passwordHash: defaultPasswordHash,
      role: 'PARTICIPANT',
      isActive: true,
    });
    await Profile.create({
      userId: candidateConsenting._id,
      specialization: 'Frontend Developer',
      skills: ['React', 'Tailwind'],
      discoveryConsent: true,
    });

    const candidateNonConsenting = await User.create({
      name: 'Private Dev',
      email: 'private@college.edu',
      passwordHash: defaultPasswordHash,
      role: 'PARTICIPANT',
      isActive: true,
    });
    await Profile.create({
      userId: candidateNonConsenting._id,
      specialization: 'Frontend Developer',
      skills: ['React'],
      discoveryConsent: false, // EXCLUDED
    });

    const discoveryRes = await request(app)
      .post('/api/discovery/teammates')
      .set('Authorization', `Bearer ${captainToken}`)
      .send({ specialization: 'Frontend Developer' });

    testAssert(discoveryRes.status === 200, 'POST /api/discovery/teammates returns 200');
    const candidates = discoveryRes.body.data;
    const foundConsenting = candidates.some((c) => c.id.toString() === candidateConsenting._id.toString());
    const foundNonConsenting = candidates.some((c) => c.id.toString() === candidateNonConsenting._id.toString());
    testAssert(foundConsenting, 'Consenting candidate is discovered');
    testAssert(!foundNonConsenting, 'Non-consenting candidate is STRICTLY excluded');

    // ----------------------------------------------------
    // FLOW STEP 8: TEAMS & WORKSPACE
    // ----------------------------------------------------
    console.log('\n--- Step 8: Teams & Workspace ---');
    const teamRes = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        eventId,
        challengeId,
        name: 'Team Nova',
        description: 'Building AI Adaptive Engine',
      });

    testAssert(teamRes.status === 201, 'POST /api/teams creates team and captain membership');
    const teamId = teamRes.body.data.team._id;

    // Get team workspace
    const getTeamRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${captainToken}`);
    testAssert(getTeamRes.status === 200, 'GET /api/teams/:teamId returns workspace');
    testAssert(getTeamRes.body.data.members.length === 1, 'Captain is active member');

    // Candidate submits join request
    const candidateToken = generateAuthToken(candidateConsenting);
    const joinReqRes = await request(app)
      .post(`/api/teams/${teamId}/join-requests`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ message: 'I can do React and UI!' });
    testAssert(joinReqRes.status === 201, 'POST /api/teams/:teamId/join-requests creates join request');
    const joinRequestId = joinReqRes.body.data._id;

    // Prevent duplicate pending request
    const duplicateJoinReq = await request(app)
      .post(`/api/teams/${teamId}/join-requests`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ message: 'Duplicate attempt' });
    testAssert(duplicateJoinReq.status === 409, 'Duplicate pending join request rejected with 409 Conflict');

    // Captain accepts join request
    const acceptJoinRes = await request(app)
      .post(`/api/join-requests/${joinRequestId}/accept`)
      .set('Authorization', `Bearer ${captainToken}`);
    testAssert(acceptJoinRes.status === 200, 'POST /api/join-requests/:requestId/accept approves candidate');

    // ----------------------------------------------------
    // FLOW STEP 9: TASKS & OPTIMISTIC LOCKING
    // ----------------------------------------------------
    console.log('\n--- Step 9: Sprint Tasks & Optimistic Concurrency ---');
    const createTaskRes = await request(app)
      .post(`/api/teams/${teamId}/tasks`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        title: 'Build Vector Search Pipeline',
        description: 'ChromaDB integration',
        priority: 'high',
        tag: 'Backend',
        targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });

    testAssert(createTaskRes.status === 201, 'POST /api/teams/:teamId/tasks creates task');
    const taskId = createTaskRes.body.data._id;
    testAssert(createTaskRes.body.data.version === 1, 'New task initialized with version: 1');

    // Successful update with version 1
    const updateTaskRes1 = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        version: 1,
        status: 'in_progress',
      });

    testAssert(updateTaskRes1.status === 200, 'PATCH /api/tasks/:taskId succeeds with matching version');
    testAssert(updateTaskRes1.body.data.version === 2, 'Task version incremented to 2');

    // Stale update using version 1 -> MUST Return 409 Conflict
    const updateTaskConflict = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        version: 1, // Stale version!
        status: 'done',
      });

    testAssert(updateTaskConflict.status === 409, 'Stale task version correctly returns 409 Conflict');
    testAssert(updateTaskConflict.body.error.code === 'CONFLICT', 'Error code is CONFLICT');

    // ----------------------------------------------------
    // FLOW STEP 10: SUBMISSION CHECKLIST & DEADLINE
    // ----------------------------------------------------
    console.log('\n--- Step 10: Submission Checklist & Submission ---');
    const checklistRes = await request(app)
      .get(`/api/teams/${teamId}/checklist`)
      .set('Authorization', `Bearer ${captainToken}`);

    testAssert(checklistRes.status === 200, 'GET /api/teams/:teamId/checklist returns readiness %');
    testAssert(checklistRes.body.data.isDeadlinePassed === false, 'Server verifies deadline has not passed');

    // Captain saves submission
    const submitRes = await request(app)
      .post(`/api/teams/${teamId}/submission`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        repositoryUrl: 'https://github.com/karthik-dev/ai-study-planner',
        deploymentUrl: 'https://study-planner-demo.vercel.app',
        demoVideoUrl: 'https://youtube.com/watch?v=sample-demo',
        presentationUrl: 'https://docs.google.com/presentation/d/demo',
        description: 'Complete adaptive learning platform for undergraduate engineering students',
        checklist: {
          githubRepo: true,
          deploymentLink: true,
          projectDescription: true,
          presentationDeck: true,
          demoVideo: true,
          finalTesting: true,
        },
        action: 'SUBMIT',
      });

    testAssert(submitRes.status === 200, 'POST /api/teams/:teamId/submission finalizes project');
    const submissionId = submitRes.body.data._id;
    testAssert(submitRes.body.data.status === 'submitted', 'Submission marked as submitted');

    // ----------------------------------------------------
    // FLOW STEP 11: MENTOR GUIDANCE
    // ----------------------------------------------------
    console.log('\n--- Step 11: Mentor Guidance & Feedback ---');
    const feedbackRes = await request(app)
      .post(`/api/teams/${teamId}/feedback`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Review Vector Search Latency',
        message: 'Great schema design. Consider Redis caching for repetitive queries.',
        rating: 5,
        blocker: '',
        recommendations: ['Add Redis cache', 'Refine presentation timing'],
      });

    testAssert(feedbackRes.status === 201, 'POST /api/teams/:teamId/feedback records guidance');
    testAssert(feedbackRes.body.data.mentorName === 'Dr. Arvind Rao', 'Feedback attributed to mentor');

    // ----------------------------------------------------
    // FLOW STEP 12: JUDGE EVALUATION & SCORING
    // ----------------------------------------------------
    console.log('\n--- Step 12: Jury Evaluation ---');
    const getSubRes = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set('Authorization', `Bearer ${judgeToken}`);
    testAssert(getSubRes.status === 200, 'GET /api/submissions/:submissionId retrieves deliverables');

    const scoreRes = await request(app)
      .post(`/api/submissions/${submissionId}/scores`)
      .set('Authorization', `Bearer ${judgeToken}`)
      .send({
        rubricVersion: 1,
        criteriaScores: [
          { criterionId: 'crit_innovation', criterionName: 'Innovation', score: 25, maxScore: 25 },
          { criterionId: 'crit_tech', criterionName: 'Technical Execution', score: 28, maxScore: 30 },
          { criterionId: 'crit_ui', criterionName: 'UI/UX', score: 18, maxScore: 20 },
          { criterionId: 'crit_impact', criterionName: 'Impact', score: 24, maxScore: 25 },
        ],
        comments: 'Outstanding architecture and live demonstration!',
      });

    testAssert(scoreRes.status === 201, 'POST /api/submissions/:submissionId/scores evaluates project');
    testAssert(scoreRes.body.data.totalScore === 95, 'Total score calculated accurately (95/100)');

    // ----------------------------------------------------
    // EDGE CASES & SECURITY RULES
    // ----------------------------------------------------
    console.log('\n--- Edge Cases & Security Rules Verification ---');

    // 1. Non-member cannot access private workspace
    const outsiderAccess = await request(app)
      .get(`/api/teams/${teamId}`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    testAssert(outsiderAccess.status === 403, 'Non-member cannot access private team workspace (403 Forbidden)');

    // 2. Mentor cannot score submissions
    const mentorScoreAttempt = await request(app)
      .post(`/api/submissions/${submissionId}/scores`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        criteriaScores: [{ criterionId: 'c1', criterionName: 'Test', score: 20, maxScore: 20 }],
      });
    testAssert(mentorScoreAttempt.status === 403, 'Mentor cannot score submissions (403 Forbidden)');

    // 3. Judge cannot score their own team (Conflict of Interest)
    const judgeTeam = await Team.create({
      eventId,
      challengeId,
      name: 'Judge Personal Team',
      createdBy: judge._id,
    });
    await Membership.create({
      userId: judge._id,
      teamId: judgeTeam._id,
      eventId,
      role: 'captain',
      status: 'active',
    });
    const judgeSub = await Submission.create({
      eventId,
      teamId: judgeTeam._id,
      challengeId,
      repositoryUrl: 'https://github.com/judge-team/repo',
      deploymentUrl: 'https://judge-demo.app',
      description: 'Judge own team submission',
      status: 'submitted',
    });

    const judgeSelfScoreAttempt = await request(app)
      .post(`/api/submissions/${judgeSub._id}/scores`)
      .set('Authorization', `Bearer ${judgeToken}`)
      .send({
        criteriaScores: [{ criterionId: 'c1', criterionName: 'Test', score: 25, maxScore: 25 }],
      });
    testAssert(judgeSelfScoreAttempt.status === 403, 'Judge cannot score own team (403 Conflict of Interest)');

    // 4. Participant cannot modify event settings
    const participantEventMod = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({ name: 'Hacked Event Name' });
    testAssert(participantEventMod.status === 403, 'Participant cannot modify event settings (403 Forbidden)');

    // 5. Submission after official deadline is rejected
    const expiredEvent = await Event.create({
      name: 'Expired Event 2025',
      slug: 'expired-2025',
      organizerId: organizer._id,
      organizerName: organizer.name,
      description: 'Event with past deadline',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      registrationDeadline: new Date('2025-01-01'),
      submissionDeadline: new Date('2025-01-02T23:59:59Z'), // Past!
      location: 'Online',
      status: 'published',
    });
    const expiredTeam = await Team.create({
      eventId: expiredEvent._id,
      challengeId,
      name: 'Late Submitting Team',
      createdBy: captainUser.id,
    });
    await Membership.create({
      userId: captainUser.id,
      teamId: expiredTeam._id,
      eventId: expiredEvent._id,
      role: 'captain',
      status: 'active',
    });

    const lateSubmissionAttempt = await request(app)
      .post(`/api/teams/${expiredTeam._id}/submission`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({
        repositoryUrl: 'https://github.com/late/repo',
        deploymentUrl: 'https://late.app',
        description: 'Attempting submission after deadline',
      });
    testAssert(lateSubmissionAttempt.status === 403, 'Submission after official deadline is rejected (403 Forbidden)');

    // 6. RAG cannot access another event documents (Cross-event isolation)
    const eventB = await Event.create({
      name: 'Event B Cybersecurity',
      slug: 'event-b-cyber',
      organizerId: organizer._id,
      organizerName: organizer.name,
      description: 'Second event',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(),
      submissionDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: 'Virtual',
      status: 'published',
    });
    const docB = await Document.create({
      eventId: eventB._id,
      title: 'Secret Defense Rulebook',
      uploadedBy: organizer._id,
      status: 'ready',
    });
    await Chunk.create({
      documentId: docB._id,
      eventId: eventB._id,
      text: 'The quantum cipher key must be declared in root directory.',
      section: 'Quantum Defense',
    });

    const ragQueryOnEventA = await request(app)
      .post(`/api/events/${eventId}/rulebook/query`)
      .set('Authorization', `Bearer ${captainToken}`)
      .send({ query: 'quantum cipher key' });

    testAssert(ragQueryOnEventA.status === 200, 'RAG query on Event A succeeds');
    testAssert(
      ragQueryOnEventA.body.data.insufficientInformation === true,
      'RAG strictly isolated: Event B document never leaks into Event A query'
    );

    // 7. AI agent cannot modify tasks without captain confirmation
    const tasksCountBefore = await Task.countDocuments({ teamId });
    const aiProposalRes = await request(app)
      .post(`/api/teams/${teamId}/ai/delivery-plan`)
      .set('Authorization', `Bearer ${candidateToken}`); // Teammate requests AI proposal

    testAssert(aiProposalRes.status === 201, 'POST /api/teams/:teamId/ai/delivery-plan creates proposal');
    const tasksCountAfter = await Task.countDocuments({ teamId });
    testAssert(tasksCountBefore === tasksCountAfter, 'AI Agent proposal did NOT directly alter tasks in DB');

    const agentRunId = aiProposalRes.body.data.agentRunId;

    // Non-captain teammate attempts to confirm -> 403
    const teammateConfirmAttempt = await request(app)
      .post(`/api/teams/${teamId}/ai/delivery-plan/${agentRunId}/confirm`)
      .set('Authorization', `Bearer ${candidateToken}`);
    testAssert(teammateConfirmAttempt.status === 403, 'Non-captain teammate cannot confirm AI plan (403)');

    // Captain confirms -> 200 and milestones applied
    const captainConfirm = await request(app)
      .post(`/api/teams/${teamId}/ai/delivery-plan/${agentRunId}/confirm`)
      .set('Authorization', `Bearer ${captainToken}`);
    testAssert(captainConfirm.status === 200, 'Captain confirmation applies approved milestones');
    testAssert(captainConfirm.body.data.confirmed === true, 'Delivery plan status updated to approved');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  }
};

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
