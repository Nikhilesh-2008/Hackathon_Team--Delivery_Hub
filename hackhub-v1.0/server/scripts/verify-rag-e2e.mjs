/**
 * End-to-end RAG verification against a running API server.
 *
 * Creates a throwaway organizer + event, ingests rulebook text through the real
 * document pipeline, asks in-scope and out-of-scope questions over HTTP, and then
 * removes every record it created.
 *
 * Usage: node server/scripts/verify-rag-e2e.mjs [baseUrl]
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { User, Event, Document, Chunk, AuditLog } from '../models/index.js';
import { hashPassword } from '../utils/auth.js';

const BASE = process.argv[2] || 'http://127.0.0.1:5001/api';
const stamp = Date.now();
const email = `rag.e2e.${stamp}@example.com`;
const password = 'Password#123';
const slug = `rag-e2e-${stamp}`;

let passed = 0;
let failed = 0;
const check = (ok, label, extra = '') => {
  if (ok) {
    console.log(`  ✓ [PASS] ${label}`);
    passed += 1;
  } else {
    console.error(`  ✗ [FAIL] ${label}${extra ? ` — ${extra}` : ''}`);
    failed += 1;
  }
};

const api = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
};

const RULEBOOK = `1.0 Eligibility
All undergraduate and postgraduate students with a valid university ID may participate. Inter-college teams are permitted in the online track.

2.0 Team Size and Formation
Teams must consist of at least 2 members and no more than 4 members. A participant may belong to only one active team per event. Team captains must register the team before the registration deadline.

3.0 Technology Restrictions
External APIs with free accessible tiers are allowed. Pre-trained open-weight models such as HuggingFace and Ollama may be used. Proprietary enterprise-only tiers are not permitted because jurors must be able to reproduce the project.

4.0 Submission Deliverables
Every team must submit a public GitHub repository with an open source license, a live deployment URL, a two-minute demo video, and a slide deck presentation. Submissions close at the official submission deadline and no late work is accepted.

5.0 Judging and Scoring
Projects are evaluated on innovation worth 25 percent, technical architecture and code quality worth 30 percent, UI and design polish worth 20 percent, and practical impact and demo worth 25 percent.`;

const main = async () => {
  await connectDatabase();

  const organizer = await User.create({
    name: 'RAG E2E Organizer',
    email,
    passwordHash: await hashPassword(password),
    role: 'ORGANIZER',
    isActive: true,
    emailVerified: true,
  });

  const event = await Event.create({
    name: `RAG E2E Event ${stamp}`,
    slug,
    organizerId: organizer._id,
    organizerName: 'RAG E2E Organizing Committee',
    description: 'Temporary event used to verify the rulebook RAG pipeline.',
    location: 'Online',
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationDeadline: new Date(Date.now() + 5 * 864e5),
    startDate: new Date(Date.now() + 6 * 864e5),
    endDate: new Date(Date.now() + 8 * 864e5),
    submissionDeadline: new Date(Date.now() + 7 * 864e5),
    status: 'published',
  });

  try {
    console.log('--- Auth ---');
    const login = await api('/auth/login', { method: 'POST', body: { email, password } });
    check(login.status === 200 && !!login.body?.data?.token, 'organizer can log in');
    const token = login.body?.data?.token;

    console.log('--- Ingestion (chunk + embed) ---');
    const ingest = await api(`/events/${event._id}/documents`, {
      method: 'POST',
      token,
      body: { title: 'RAG E2E Official Rulebook', version: '1.0', sourceType: 'text', content: RULEBOOK },
    });
    check(ingest.status === 201, 'POST /events/:id/documents returns 201', `got ${ingest.status}`);
    check(ingest.body?.data?.status === 'ready', 'document indexed and marked ready');

    const chunks = await Chunk.find({ eventId: event._id });
    check(chunks.length >= 4, `rulebook split into multiple chunks (${chunks.length})`);
    check(
      chunks.every((c) => Array.isArray(c.embedding) && c.embedding.length === 256),
      'every chunk carries a 256-dim embedding'
    );
    const sizes = new Set(chunks.map((c) => c.section));
    check(sizes.size >= 4, `chunks retain section headings (${[...sizes].join(' | ')})`);

    console.log('--- Event listing ---');
    const listing = await api('/rulebook/events', { token });
    check(listing.status === 200, 'GET /rulebook/events returns 200');
    const listed = (listing.body?.data || []).find((e) => String(e.id) === String(event._id));
    check(!!listed, 'newly indexed event appears in the rulebook event list');
    check(listed?.chunkCount === chunks.length, 'listing reports the correct chunk count');

    console.log('--- In-scope questions (must be grounded) ---');
    const teamSize = await api(`/events/${event._id}/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: 'How many members can a team have?' },
    });
    check(teamSize.status === 200, 'rulebook query returns 200');
    check(teamSize.body?.data?.grounded === true, 'team-size question is grounded in the rulebook');
    check(teamSize.body?.data?.insufficientInformation === false, 'grounded answer is not flagged insufficient');
    check((teamSize.body?.data?.citations || []).length > 0, 'grounded answer includes citations');
    check(
      /2|4|two|four/i.test(teamSize.body?.data?.answer || ''),
      'answer text contains the rulebook limits (2-4 members)',
      teamSize.body?.data?.answer?.slice(0, 120)
    );
    check(
      (teamSize.body?.data?.citations || []).every((c) => c.documentTitle === 'RAG E2E Official Rulebook'),
      'citations point at this event rulebook only'
    );

    const deliverables = await api(`/events/${event._id}/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: 'what must we submit as final deliverables?' },
    });
    check(deliverables.body?.data?.grounded === true, 'deliverables question is grounded');
    check(
      /github|video|deck|deployment/i.test(deliverables.body?.data?.answer || ''),
      'deliverables answer quotes the rulebook requirements'
    );

    console.log('--- Out-of-scope questions (must refuse + escalate) ---');
    const offTopic = await api(`/events/${event._id}/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: 'Who won the football world cup in 2018?' },
    });
    check(offTopic.status === 200, 'out-of-scope query still returns 200');
    check(offTopic.body?.data?.grounded === false, 'out-of-scope query is NOT grounded');
    check(offTopic.body?.data?.outOfScope === true, 'out-of-scope flagged explicitly');
    check(offTopic.body?.data?.insufficientInformation === true, 'out-of-scope flagged insufficientInformation');
    check((offTopic.body?.data?.citations || []).length === 0, 'out-of-scope answer carries no citations');
    check(
      /contact|organizer|reach/i.test(offTopic.body?.data?.answer || ''),
      'answer tells the user to contact a person/organizer',
      offTopic.body?.data?.answer?.slice(0, 140)
    );
    check(!!offTopic.body?.data?.contact?.label, 'structured contact block is returned');
    check(
      offTopic.body?.data?.contact?.name === 'RAG E2E Organizing Committee',
      'contact names the event organizer'
    );

    const unrelatedTech = await api(`/events/${event._id}/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: 'Can we deploy on a Kubernetes cluster with our own GPU rack?' },
    });
    check(
      unrelatedTech.body?.data?.grounded === false || /\bno\b|not permitted/i.test(unrelatedTech.body?.data?.answer || ''),
      'question outside rulebook scope is refused or answered only from the rulebook'
    );

    console.log('--- Guard rails ---');
    const noAuth = await fetch(`${BASE}/rulebook/events`);
    check(noAuth.status === 401, 'rulebook endpoints require authentication');
    const emptyQuery = await api(`/events/${event._id}/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: '   ' },
    });
    check(emptyQuery.status === 400, 'blank query rejected with 400');
    const badEvent = await api(`/events/67039a00b1a2c3d4e5f6ffff/rulebook/query`, {
      method: 'POST',
      token,
      body: { query: 'team size' },
    });
    check([400, 404].includes(badEvent.status), 'unknown event rejected');

    console.log('--- Isolation ---');
    const otherEvent = await Event.create({
      name: `RAG E2E Empty Event ${stamp}`,
      slug: `${slug}-empty`,
      organizerId: organizer._id,
      organizerName: 'RAG E2E Organizing Committee',
      description: 'No rulebook ingested.',
      location: 'Online',
      minTeamSize: 2,
      maxTeamSize: 4,
      registrationDeadline: new Date(Date.now() + 5 * 864e5),
      startDate: new Date(Date.now() + 6 * 864e5),
      endDate: new Date(Date.now() + 8 * 864e5),
      submissionDeadline: new Date(Date.now() + 7 * 864e5),
      status: 'published',
    });
    try {
      const emptyEventAsk = await api(`/events/${otherEvent._id}/rulebook/query`, {
        method: 'POST',
        token,
        body: { query: 'How many members can a team have?' },
      });
      check(emptyEventAsk.body?.data?.grounded === false, 'event without a rulebook never borrows another event data');
      check(
        (emptyEventAsk.body?.data?.citations || []).length === 0,
        'no citations leak from the populated event'
      );
      check(
        /contact|organizer/i.test(emptyEventAsk.body?.data?.answer || ''),
        'empty rulebook routes the user to the organizer'
      );
    } finally {
      await Event.findByIdAndDelete(otherEvent._id);
    }
  } finally {
    console.log('--- Cleanup ---');
    const docs = await Document.find({ eventId: event._id }).select('_id');
    const docIds = docs.map((d) => d._id);
    const chunksDeleted = await Chunk.deleteMany({ eventId: event._id });
    const docsDeleted = await Document.deleteMany({ _id: { $in: docIds } });
    const logsDeleted = await AuditLog.deleteMany({ eventId: event._id });
    const eventsDeleted = await Event.deleteMany({ slug: { $regex: `^${slug}` } });
    const usersDeleted = await User.deleteMany({ email });
    console.log(
      `  cleaned: chunks=${chunksDeleted.deletedCount}, documents=${docsDeleted.deletedCount}, ` +
        `auditLogs=${logsDeleted.deletedCount}, events=${eventsDeleted.deletedCount}, users=${usersDeleted.deletedCount}`
    );
    await disconnectDatabase();
  }

  console.log(`\nRAG E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
};

main().catch(async (err) => {
  console.error('RAG E2E crashed:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
