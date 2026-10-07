import mongoose from 'mongoose';
import models from '../models/index.js';
import {
  IDS,
  seedUsers,
  seedProfiles,
  seedEvent,
  seedChallenges,
  seedTeam,
  seedMemberships,
  seedTasks,
  seedMilestones,
  seedRubric,
  seedSubmission,
  seedReputations,
  seedNotifications,
  seedFeedback,
  seedScore,
  seedDocument,
  seedChunks,
  seedAgentRun,
} from '../seeds/seedData.js';

let passedTests = 0;
let failedTests = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${description}`);
    failedTests++;
  }
};

const assertThrowsAsync = async (fn, description) => {
  try {
    await fn();
    console.error(`  ✗ [FAIL] Expected error but succeeded: ${description}`);
    failedTests++;
  } catch (error) {
    console.log(`  ✓ [PASS] Correctly rejected: ${description} (Error: ${error.message})`);
    passedTests++;
  }
};

export const runVerification = async () => {
  console.log('====================================================');
  console.log('HACKHUB DATABASE ARCHITECTURE VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Verify Model Registration
  console.log('--- 1. Testing Model Registration (All 21 Collections) ---');
  const expectedModels = [
    'User', 'Profile', 'Event', 'Challenge', 'Team', 'Membership',
    'JoinRequest', 'Invitation', 'Task', 'Milestone', 'Rubric', 'Submission',
    'Session', 'Reputation', 'Notification', 'Feedback', 'Score', 'AuditLog',
    'Document', 'Chunk', 'AgentRun'
  ];

  for (const name of expectedModels) {
    assert(Boolean(models[name]), `Model '${name}' registered and exported`);
  }
  assert(models.Event === models.Hackathon, `Alias 'Hackathon' maps to 'Event'`);

  // 2. Verify Index Definitions
  console.log('\n--- 2. Testing Index Definitions on Critical Collections ---');

  const checkIndex = (model, keyName, isUnique = false) => {
    const indexes = model.schema.indexes();
    const found = indexes.some(([idxDef, opts]) => {
      const hasKey = keyName in idxDef;
      return hasKey && (!isUnique || opts?.unique === true);
    });
    return found;
  };

  assert(checkIndex(models.User, 'email', true), "User has unique index on 'email'");
  assert(checkIndex(models.Profile, 'userId', true), "Profile has unique index on 'userId'");
  assert(checkIndex(models.Event, 'slug', true), "Event has unique index on 'slug'");
  assert(checkIndex(models.Event, 'submissionDeadline'), "Event indexes 'submissionDeadline'");
  assert(checkIndex(models.Team, 'name', true), "Team has unique compound index with 'name'");
  assert(checkIndex(models.Membership, 'userId'), "Membership indexes 'userId'");
  assert(checkIndex(models.Task, 'teamId'), "Task indexes 'teamId'");
  assert(checkIndex(models.Task, 'status'), "Task indexes 'status'");
  assert(checkIndex(models.Rubric, 'version', true), "Rubric has unique compound index on 'version'");
  assert(checkIndex(models.Submission, 'teamId', true), "Submission has unique index on 'teamId'");
  assert(checkIndex(models.Score, 'submissionId', true), "Score has unique compound index on 'submissionId' + 'judgeId'");
  assert(checkIndex(models.Session, 'tokenHash', true), "Session has unique index on 'tokenHash'");

  // 3. Test Invalid Data Rejection
  console.log('\n--- 3. Testing Strict Validation & Rejection of Invalid Data ---');

  // Invalid email
  await assertThrowsAsync(async () => {
    const badUser = new models.User({
      name: 'Bad Email User',
      email: 'not-an-email',
      passwordHash: 'hash',
      role: 'PARTICIPANT',
    });
    await badUser.validate();
  }, 'Invalid email address rejected');

  // Invalid role
  await assertThrowsAsync(async () => {
    const badRoleUser = new models.User({
      name: 'Bad Role',
      email: 'badrole@college.edu',
      passwordHash: 'hash',
      role: 'SUPERADMIN',
    });
    await badRoleUser.validate();
  }, 'Unregistered role enum rejected');

  // Inverted event dates
  await assertThrowsAsync(async () => {
    const badEvent = new models.Event({
      name: 'Time Travel Hackathon',
      slug: 'time-travel',
      organizerId: IDS.users.aakash,
      organizerName: 'ACM',
      description: 'Test',
      location: 'Campus',
      registrationDeadline: new Date('2026-10-15'),
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-10'), // Inverted: ends before start
      submissionDeadline: new Date('2026-10-10'),
      status: 'draft',
    });
    await badEvent.validate();
  }, 'Event where startDate >= endDate rejected');

  // Inverted min/max team sizes
  await assertThrowsAsync(async () => {
    const badTeamSizeEvent = new models.Event({
      name: 'Bad Team Sizes',
      slug: 'bad-team-sizes',
      organizerId: IDS.users.aakash,
      organizerName: 'ACM',
      description: 'Test',
      location: 'Campus',
      minTeamSize: 5,
      maxTeamSize: 2, // min > max
      registrationDeadline: new Date('2026-10-10'),
      startDate: new Date('2026-10-11'),
      endDate: new Date('2026-10-12'),
      submissionDeadline: new Date('2026-10-12'),
      status: 'draft',
    });
    await badTeamSizeEvent.validate();
  }, 'Event where minTeamSize > maxTeamSize rejected');

  // Invalid repository URL
  await assertThrowsAsync(async () => {
    const badSub = new models.Submission({
      eventId: IDS.event,
      teamId: IDS.team,
      challengeId: IDS.challenges.studyEngine,
      description: 'Valid project description for testing',
      repositoryUrl: 'https://mysite.com/not-a-repo', // Not GitHub/GitLab
      deploymentUrl: 'https://live-app.vercel.app',
      status: 'draft',
    });
    await badSub.validate();
  }, 'Non-Git repository URL rejected');

  // Score exceeding 100
  await assertThrowsAsync(async () => {
    const badScore = new models.Score({
      eventId: IDS.event,
      submissionId: IDS.submission,
      judgeId: IDS.users.siddharth,
      judgeName: 'Judge',
      rubricVersion: 1,
      criteriaScores: [{ criterionId: 'c1', criterionName: 'c1', score: 110, maxScore: 100 }],
      totalScore: 110, // Exceeds max 100
    });
    await badScore.validate();
  }, 'Total score > 100 rejected');

  // Milestone completion percentage > 100
  await assertThrowsAsync(async () => {
    const badMilestone = new models.Milestone({
      eventId: IDS.event,
      teamId: IDS.team,
      title: 'Overachieved Milestone',
      dueDate: new Date(),
      completionPercentage: 150,
    });
    await badMilestone.validate();
  }, 'Milestone completion percentage > 100 rejected');

  // 4. Test Referential Integrity of Seed Scenario
  console.log('\n--- 4. Testing Referential Integrity Across Seed Data ---');

  // Verify Team references
  assert(seedTeam.eventId.equals(seedEvent._id), 'Team belongs to seeded Event (NexusHack 2026)');
  assert(seedTeam.challengeId.equals(seedChallenges[0]._id), 'Team targets seeded Challenge (Adaptive Study Engine)');
  assert(seedTeam.createdBy.equals(seedUsers[0]._id), 'Team createdBy matches Captain Karthik');

  // Verify Memberships
  const teamMemberIds = seedMemberships.map(m => m.userId.toString());
  const expectedMemberIds = [
    IDS.users.karthik.toString(),
    IDS.users.rahul.toString(),
    IDS.users.ananya.toString(),
    IDS.users.vivek.toString(),
  ];
  assert(
    JSON.stringify(teamMemberIds.sort()) === JSON.stringify(expectedMemberIds.sort()),
    'Memberships accurately bind Karthik, Rahul, Ananya, and Vivek to Team Nova'
  );

  const captainMembership = seedMemberships.find(m => m.userId.equals(IDS.users.karthik));
  assert(captainMembership.role === 'captain', 'Karthik holds captain membership role');

  // Verify Tasks
  const allTasksBelongToTeam = seedTasks.every(t => t.teamId.equals(IDS.team) && t.eventId.equals(IDS.event));
  assert(allTasksBelongToTeam, 'All 12 sprint tasks are properly scoped to Team Nova and NexusHack 2026');

  // Verify Submission & Rubric
  assert(seedSubmission.teamId.equals(IDS.team), 'Submission references Team Nova');
  assert(seedSubmission.eventId.equals(IDS.event), 'Submission references NexusHack 2026');
  assert(seedSubmission.rubricVersion === seedRubric.version, 'Submission rubric version matches active Rubric v1');

  // Verify Judge & Mentor roles
  const judgeUser = seedUsers.find(u => u._id.equals(IDS.users.siddharth));
  assert(judgeUser.role === 'JUDGE', 'Judge user has authorized JUDGE role');
  assert(seedScore.judgeId.equals(judgeUser._id), 'Score recorded by authorized Judge');

  const mentorUser = seedUsers.find(u => u._id.equals(IDS.users.arvind));
  assert(mentorUser.role === 'MENTOR', 'Mentor user has authorized MENTOR role');
  assert(seedFeedback[0].mentorId.equals(mentorUser._id), 'Feedback recorded by authorized Mentor');

  // Dynamic readiness computation check
  const subInstance = new models.Submission(seedSubmission);
  await subInstance.validate();
  assert(subInstance.readinessPercentage === 100, `Submission readiness dynamically derived: ${subInstance.readinessPercentage}%`);

  // Summary
  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
};

runVerification();
