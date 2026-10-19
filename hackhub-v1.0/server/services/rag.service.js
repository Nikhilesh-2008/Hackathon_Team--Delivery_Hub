import { Chunk, Event, Team } from '../models/index.js';
import { AppError } from '../utils/response.js';
import { cosineSimilarity, embedText, tokenize, uniqueTerms, EMBEDDING_MODEL } from '../utils/embedding.js';

const MIN_RELEVANCE = Number(process.env.RAG_MIN_RELEVANCE || 0.16);
const MAX_CONTEXT_CHUNKS = 3;
const MAX_ANSWER_CHARS = 900;
const FALLBACK_CONTACT_ROLES = ['ORGANIZER', 'ADMIN', 'MENTOR'];

const personaForRole = (role) => {
  switch ((role || '').toUpperCase()) {
    case 'ORGANIZER':
      return {
        kind: 'organizer',
        label: 'Event Organizer',
        intro: 'For anything beyond the official rulebook, contact the event organizer team.',
      };
    case 'ADMIN':
      return {
        kind: 'admin',
        label: 'HackHub Administrator',
        intro: 'For anything beyond the official rulebook, contact the platform administrator.',
      };
    case 'MENTOR':
      return {
        kind: 'mentor',
        label: 'Hackathon Mentor',
        intro: 'For anything beyond the official rulebook, reach out to your assigned mentor.',
      };
    default:
      return {
        kind: 'organizer',
        label: 'Hackathon Organizers',
        intro: 'For anything beyond the official rulebook, contact the hackathon organizers.',
      };
  }
};

/**
 * Resolve who a participant should contact when the rulebook cannot answer.
 * Actual people attached to the event are preferred over the generic persona.
 */
const buildContact = (event) => {
  const persona = personaForRole('PARTICIPANT');

  if (event) {
    const contacts = [];

    if (event.organizerName) {
      contacts.push({
        role: 'Event Organizer',
        name: event.organizerName,
        email: event.contactEmail || '',
      });
    }

    if (event.supportEmail && !contacts.some((c) => c.email === event.supportEmail)) {
      contacts.push({
        role: 'Event Support Desk',
        name: event.organizerName || 'Event Support',
        email: event.supportEmail,
      });
    }

    if (contacts.length > 0) {
      return {
        ...persona,
        label: contacts[0].role,
        name: contacts[0].name,
        email: contacts[0].email,
        message: `${persona.intro} These are the people responsible for this event.`,
        contacts,
      };
    }

    return {
      ...persona,
      name: event.organizerName || event.name,
      email: '',
      message: `${persona.intro} The organizing body for ${event.name} is ${event.organizerName}, but no direct contact address is published in the platform yet.`,
      contacts: [],
    };
  }

  return {
    ...persona,
    name: '',
    email: '',
    message: `${persona.intro} Ask a member of the organizing committee or your assigned mentor.`,
    contacts: [],
  };
};

const toCitation = (chunk, relevance) => ({
  documentId: chunk.documentId?._id || chunk.documentId,
  documentTitle: chunk.documentId?.title || 'Event Rulebook',
  version: chunk.version || chunk.documentId?.version || '1.0',
  section: chunk.section || 'General',
  page: chunk.page || 1,
  relevance: Number(relevance.toFixed(4)),
  excerpt: chunk.text.length > 220 ? `${chunk.text.slice(0, 220)}...` : chunk.text,
});

/**
 * Hybrid retrieval: cosine similarity over local embeddings fused with exact
 * term-overlap scoring. Both signals are computed inside the event scope only.
 */
const rankChunks = (chunks, query) => {
  const queryVector = embedText(query);
  const queryTerms = uniqueTerms(query);
  const hashedQuery = new Set(tokenize(query));

  return chunks
    .map((chunk) => {
      const chunkVector =
        Array.isArray(chunk.embedding) && chunk.embedding.length > 0
          ? chunk.embedding
          : embedText(chunk.text);

      const semantic = cosineSimilarity(queryVector, chunkVector);

      const chunkTerms = new Set(tokenize(chunk.text));
      const overlap = queryTerms.filter((term) => chunkTerms.has(term)).length;
      const lexical = queryTerms.length > 0 ? overlap / queryTerms.length : 0;

      // Word-boundary aware raw substring hits catch exact phrases embeddings soften.
      const haystack = chunk.text.toLowerCase();
      let phrase = 0;
      for (const term of hashedQuery) {
        if (term.length > 3 && haystack.includes(term)) phrase += 1;
      }
      const phraseScore = hashedQuery.size > 0 ? phrase / hashedQuery.size : 0;

      const relevance = 0.55 * semantic + 0.3 * lexical + 0.15 * phraseScore;

      return { chunk, relevance, semantic, lexical, phraseScore };
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
};

const composeAnswer = (query, matches) => {
  if (!matches.length) return '';
  const primary = matches[0].chunk;
  const supporting = matches.slice(1).map((m) => m.chunk.section).filter(Boolean);

  let answer = primary.text.trim();
  if (answer.length > MAX_ANSWER_CHARS) answer = `${answer.slice(0, MAX_ANSWER_CHARS)}...`;

  const location = `Rulebook v${primary.version || '1.0'} · ${primary.section || 'General'}`;
  const lines = [answer, '', `Source: ${location}`];
  if (supporting.length) {
    lines.push(`Related sections: ${[...new Set(supporting)].slice(0, 2).join(', ')}`);
  }
  return lines.join('\n');
};

const confidenceFrom = (matches) => {
  if (!matches.length) return 0;
  const top = matches[0].relevance;
  const spread = matches.length > 1 ? top - matches[1].relevance : top;
  return Number(Math.min(0.98, 0.45 + top * 1.4 + spread * 0.1).toFixed(3));
};

export const listRulebookEvents = async () => {
  const grouped = await Chunk.aggregate([
    {
      $group: {
        _id: '$eventId',
        chunks: { $sum: 1 },
        documents: { $addToSet: '$documentId' },
        lastIndexedAt: { $max: '$createdAt' },
      },
    },
    { $sort: { lastIndexedAt: -1 } },
    { $limit: 50 },
  ]);

  if (grouped.length === 0) return [];

  const events = await Event.find({ _id: { $in: grouped.map((g) => g._id) } })
    .select('name slug status organizerName description')
    .lean();

  const byId = new Map(events.map((e) => [e._id.toString(), e]));

  return grouped
    .filter((g) => byId.has(g._id.toString()))
    .map((g) => {
      const event = byId.get(g._id.toString());
      return {
        id: g._id,
        name: event.name,
        slug: event.slug,
        status: event.status,
        organizerName: event.organizerName,
        chunkCount: g.chunks,
        documentCount: g.documents.length,
        lastIndexedAt: g.lastIndexedAt,
      };
    });
};

export const queryRulebook = async (eventId, user, { query, teamId }) => {
  if (!query || !query.trim()) {
    throw new AppError('VALIDATION_ERROR', 'Search query cannot be empty', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (teamId) {
    const team = await Team.findById(teamId);
    if (team && team.eventId.toString() !== event._id.toString()) {
      throw new AppError('FORBIDDEN', 'Team does not belong to this event', 403);
    }
  }

  const contact = buildContact(event);

  // STRICT EVENT SCOPING: never allow one event's rulebook to leak into another.
  const chunks = await Chunk.find({ eventId: event._id }).populate('documentId', 'title version status');

  if (chunks.length === 0) {
    return {
      answer:
        `No official rulebook has been ingested for ${event.name} yet, so I cannot answer this from the rulebook.\n\n` +
        `${contact.message}\n\n` +
        `Source: none — no rulebook document is available for this event.`,
      confidence: 0,
      citations: [],
      insufficientInformation: true,
      grounded: false,
      outOfScope: true,
      query,
      contact,
      trace: {
        embeddingModel: EMBEDDING_MODEL,
        chunksConsidered: 0,
        chunksUsed: 0,
        threshold: MIN_RELEVANCE,
      },
    };
  }

  const ranked = rankChunks(chunks, query);
  const committed = ranked.filter((item) => item.relevance >= MIN_RELEVANCE).slice(0, MAX_CONTEXT_CHUNKS);

  if (committed.length === 0) {
    return {
      answer:
        `I can only answer from the official rulebook for ${event.name}, and it does not cover this question.\n\n` +
        `${contact.message}\n\n` +
        `Source: none — no rulebook section matched with sufficient confidence.`,
      confidence: Number((ranked[0]?.relevance || 0).toFixed(3)),
      citations: [],
      insufficientInformation: true,
      grounded: false,
      outOfScope: true,
      query,
      contact,
      trace: {
        embeddingModel: EMBEDDING_MODEL,
        chunksConsidered: chunks.length,
        chunksUsed: 0,
        threshold: MIN_RELEVANCE,
        bestRelevance: Number((ranked[0]?.relevance || 0).toFixed(4)),
      },
    };
  }

  return {
    answer: composeAnswer(query, committed),
    confidence: confidenceFrom(committed),
    citations: committed.map((item) => toCitation(item.chunk, item.relevance)),
    insufficientInformation: false,
    grounded: true,
    outOfScope: false,
    query,
    contact: {
      ...contact,
      message: `If you still need clarification after reading the cited rulebook section, ${contact.intro.toLowerCase()}`,
    },
    trace: {
      embeddingModel: EMBEDDING_MODEL,
      chunksConsidered: chunks.length,
      chunksUsed: committed.length,
      threshold: MIN_RELEVANCE,
      scores: committed.map((m) => ({
        section: m.chunk.section,
        relevance: Number(m.relevance.toFixed(4)),
        semantic: Number(m.semantic.toFixed(4)),
        lexical: Number(m.lexical.toFixed(4)),
      })),
    },
  };
};

export default {
  queryRulebook,
  listRulebookEvents,
  MIN_RELEVANCE,
  FALLBACK_CONTACT_ROLES,
};
