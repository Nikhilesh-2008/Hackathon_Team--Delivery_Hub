import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  User,
  Profile,
  Event,
  Challenge,
  Team,
  Membership,
  Task,
  Milestone,
  Rubric,
  Submission,
  Reputation,
  Notification,
  Feedback,
  Score,
  Document,
  Chunk,
  AgentRun,
} from '../models/index.js';
import {
  IDS,
  seedUsers,
  seedProfiles,
  seedEvent,
  seedChallenges,
  seedTeam,
  seedMemberships,
  seedRubric,
  seedTasks,
  seedMilestones,
  seedSubmission,
  seedReputations,
  seedNotifications,
  seedFeedback,
  seedScore,
  seedDocument,
  seedChunks,
  seedAgentRun,
} from './seedData.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const validateAllSeedDocuments = async () => {
  console.log('[Seed] Validating seed records against Mongoose schemas...');

  // Validate Users
  for (const u of seedUsers) {
    const doc = new User(u);
    await doc.validate();
  }
  console.log(`  ✓ ${seedUsers.length} Users passed validation`);

  // Validate Profiles
  for (const p of seedProfiles) {
    const doc = new Profile(p);
    await doc.validate();
  }
  console.log(`  ✓ ${seedProfiles.length} Profiles passed validation`);

  // Validate Event
  const eventDoc = new Event(seedEvent);
  await eventDoc.validate();
  console.log(`  ✓ Event (${seedEvent.name}) passed validation`);

  // Validate Challenges
  for (const c of seedChallenges) {
    const doc = new Challenge(c);
    await doc.validate();
  }
  console.log(`  ✓ ${seedChallenges.length} Challenges passed validation`);

  // Validate Team
  const teamDoc = new Team(seedTeam);
  await teamDoc.validate();
  console.log(`  ✓ Team (${seedTeam.name}) passed validation`);

  // Validate Memberships
  for (const m of seedMemberships) {
    const doc = new Membership(m);
    await doc.validate();
  }
  console.log(`  ✓ ${seedMemberships.length} Memberships passed validation`);

  // Validate Tasks
  for (const t of seedTasks) {
    const doc = new Task(t);
    await doc.validate();
  }
  console.log(`  ✓ ${seedTasks.length} Tasks passed validation`);

  // Validate Milestones
  for (const m of seedMilestones) {
    const doc = new Milestone(m);
    await doc.validate();
  }
  console.log(`  ✓ ${seedMilestones.length} Milestones passed validation`);

  // Validate Rubric
  const rubricDoc = new Rubric(seedRubric);
  await rubricDoc.validate();
  console.log(`  ✓ Rubric v${seedRubric.version} passed validation`);

  // Validate Submission
  const subDoc = new Submission(seedSubmission);
  await subDoc.validate();
  console.log(`  ✓ Submission passed validation (Checklist readiness: ${subDoc.readinessPercentage}%)`);

  // Validate Reputations
  for (const r of seedReputations) {
    const doc = new Reputation(r);
    await doc.validate();
  }
  console.log(`  ✓ ${seedReputations.length} Reputation entries passed validation`);

  // Validate Notifications
  for (const n of seedNotifications) {
    const doc = new Notification(n);
    await doc.validate();
  }
  console.log(`  ✓ ${seedNotifications.length} Notifications passed validation`);

  // Validate Feedback
  for (const f of seedFeedback) {
    const doc = new Feedback(f);
    await doc.validate();
  }
  console.log(`  ✓ ${seedFeedback.length} Mentor feedback notes passed validation`);

  // Validate Score
  const scoreDoc = new Score(seedScore);
  await scoreDoc.validate();
  console.log(`  ✓ Score passed validation (${seedScore.totalScore}/100)`);

  // Validate Document & Chunks
  const docDoc = new Document(seedDocument);
  await docDoc.validate();
  for (const ch of seedChunks) {
    const chunkDoc = new Chunk(ch);
    await chunkDoc.validate();
  }
  console.log(`  ✓ Rulebook document & ${seedChunks.length} Chunks passed validation`);

  // Validate AgentRun
  const agentDoc = new AgentRun(seedAgentRun);
  await agentDoc.validate();
  console.log(`  ✓ AgentRun proposal passed validation`);

  return true;
};

export const exportSeedJson = () => {
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      hackathon: 'NexusHack 2026: AI & Intelligent Systems',
      team: 'Team Nova',
      project: 'Intelligent Adaptive Study Engine',
    },
    ids: IDS,
    users: seedUsers,
    profiles: seedProfiles,
    event: seedEvent,
    challenges: seedChallenges,
    team: seedTeam,
    memberships: seedMemberships,
    rubric: seedRubric,
    tasks: seedTasks,
    milestones: seedMilestones,
    submission: seedSubmission,
    reputations: seedReputations,
    notifications: seedNotifications,
    feedback: seedFeedback,
    score: seedScore,
    document: seedDocument,
    chunks: seedChunks,
    agentRun: seedAgentRun,
  };

  const outputPath = path.join(__dirname, 'export-seed.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
  console.log(`[Seed] Exported static seed dataset to ${outputPath}`);
};

export const executeDatabaseSeed = async () => {
  try {
    // 1. Run strict schema validations in-memory
    await validateAllSeedDocuments();

    // 2. Export offline seed dataset JSON
    exportSeedJson();

    // 3. Attempt connection to MongoDB if accessible
    let isConnected = false;
    try {
      await connectDatabase();
      isConnected = true;
    } catch {
      console.log('[Seed] Note: MongoDB server not running locally. Schema validation & JSON export succeeded.');
      return;
    }

    if (isConnected) {
      console.log('[Seed] Purging existing demo records...');
      await Promise.all([
        User.deleteMany({ _id: { $in: Object.values(IDS.users) } }),
        Profile.deleteMany({ _id: { $in: Object.values(IDS.profiles) } }),
        Event.deleteOne({ _id: IDS.event }),
        Challenge.deleteMany({ eventId: IDS.event }),
        Team.deleteOne({ _id: IDS.team }),
        Membership.deleteMany({ teamId: IDS.team }),
        Task.deleteMany({ teamId: IDS.team }),
        Milestone.deleteMany({ teamId: IDS.team }),
        Rubric.deleteMany({ eventId: IDS.event }),
        Submission.deleteMany({ teamId: IDS.team }),
        Reputation.deleteMany({ eventId: IDS.event }),
        Notification.deleteMany({ userId: { $in: Object.values(IDS.users) } }),
        Feedback.deleteMany({ teamId: IDS.team }),
        Score.deleteMany({ eventId: IDS.event }),
        Document.deleteMany({ eventId: IDS.event }),
        Chunk.deleteMany({ eventId: IDS.event }),
        AgentRun.deleteMany({ teamId: IDS.team }),
      ]);

      console.log('[Seed] Inserting fresh seed records into MongoDB...');
      await User.insertMany(seedUsers);
      await Profile.insertMany(seedProfiles);
      await Event.create(seedEvent);
      await Challenge.insertMany(seedChallenges);
      await Team.create(seedTeam);
      await Membership.insertMany(seedMemberships);
      await Task.insertMany(seedTasks);
      await Milestone.insertMany(seedMilestones);
      await Rubric.create(seedRubric);
      await Submission.create(seedSubmission);
      await Reputation.insertMany(seedReputations);
      await Notification.insertMany(seedNotifications);
      await Feedback.insertMany(seedFeedback);
      await Score.create(seedScore);
      await Document.create(seedDocument);
      await Chunk.insertMany(seedChunks);
      await AgentRun.create(seedAgentRun);

      console.log('[Seed] ✓ All collections successfully seeded in MongoDB!');
      await disconnectDatabase();
    }
  } catch (error) {
    console.error(`[Seed] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

// If run directly via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  executeDatabaseSeed();
}
