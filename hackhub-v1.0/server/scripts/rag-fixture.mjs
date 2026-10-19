/**
 * Temporary fixture for browser-testing the Rulebook RAG tab.
 * Creates an organizer + published event + ingested rulebook, then prints the ids.
 * Usage: node server/scripts/rag-fixture.mjs
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { User, Event, Document, Chunk, AuditLog } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';
import { embedText, EMBEDDING_MODEL } from '../utils/embedding.js';
import { splitIntoChunks } from '../services/document.service.js';

const stamp = Date.now();
const email = 'rag.demo.organizer@example.com';
const password = 'Password#123';

const RULEBOOK = `1.0 Eligibility
All undergraduate and postgraduate students with a valid university ID may participate. Inter-college teams are permitted in the online track.

2.0 Team Size and Formation
Teams must consist of at least 2 members and no more than 4 members. A participant may belong to only one active team per event.

3.0 Technology Restrictions
External APIs with free accessible tiers are allowed. Open-weight models such as HuggingFace and Ollama may be used. Proprietary enterprise-only tiers are not permitted because jurors must reproduce the project.

4.0 Submission Deliverables
Every team must submit a public GitHub repository with an open source license, a live deployment URL, a two-minute demo video, and a slide deck presentation.

5.0 Judging and Scoring
Projects are evaluated on innovation worth 25 percent, technical architecture and code quality worth 30 percent, UI polish worth 20 percent, and practical impact worth 25 percent.`;

await connectDatabase();

await User.deleteMany({ email });
await Event.deleteMany({ slug: { $regex: '^rag-demo-' } });

const organizer = await User.create({
  name: 'Demo Organizer',
  email,
  passwordHash: await hashPassword(password),
  role: 'ORGANIZER',
  isActive: true,
  emailVerified: true,
});

const event = await Event.create({
  name: 'RAG Demo Hackathon 2026',
  slug: `rag-demo-${stamp}`,
  organizerId: organizer._id,
  organizerName: 'Demo Organizing Committee',
  description: 'Event used to demonstrate the rulebook RAG assistant.',
  location: 'Online',
  minTeamSize: 2,
  maxTeamSize: 4,
  registrationDeadline: new Date(Date.now() + 5 * 864e5),
  startDate: new Date(Date.now() + 6 * 864e5),
  endDate: new Date(Date.now() + 8 * 864e5),
  submissionDeadline: new Date(Date.now() + 7 * 864e5),
  status: 'published',
});

const doc = await Document.create({
  eventId: event._id,
  title: 'RAG Demo Official Rulebook',
  version: '1.0',
  sourceType: 'text',
  status: 'ready',
  uploadedBy: organizer._id,
});

const parts = splitIntoChunks(RULEBOOK, 'RAG Demo Official Rulebook');
for (const part of parts) {
  await Chunk.create({
    documentId: doc._id,
    eventId: event._id,
    version: '1.0',
    section: part.section,
    page: 1,
    text: part.text,
    embedding: embedText(part.text),
    embeddingModel: EMBEDDING_MODEL,
    embeddingVersion: '1',
  });
}
await AuditLog.create({
  eventId: event._id,
  actorId: organizer._id,
  actorRole: organizer.role,
  action: 'DOCUMENT_UPLOADED',
  entityType: 'Document',
  entityId: doc._id,
  reason: 'Rulebook fixture for RAG demo',
});

console.log(JSON.stringify({ email, password, eventId: event._id.toString(), chunks: parts.length }, null, 2));
await disconnectDatabase();
