import { Chunk, Event, Team } from '../models/index.js';
import { AppError } from '../utils/response.js';

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

  // STRICT EVENT SCOPING: Never allow one event's rulebook to leak into another event
  const chunks = await Chunk.find({ eventId: event._id }).populate('documentId', 'title version');

  if (!chunks || chunks.length === 0) {
    return {
      answer: 'No official rulebook documents have been ingested for this event yet. Please contact the hackathon organizers.',
      confidence: 0,
      citations: [],
      insufficientInformation: true,
    };
  }

  // Tokenize and rank chunks against query
  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredChunks = chunks.map((chunk) => {
    const chunkText = chunk.text.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (chunkText.includes(word)) {
        score += 1;
      }
    }
    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const bestMatch = scoredChunks[0];

  // Insufficient Information state when evidence is inadequate
  if (!bestMatch || bestMatch.score === 0) {
    return {
      answer: 'Insufficient information in the official event rulebook to answer this query. Please check with hackathon staff or mentors for guidance.',
      confidence: 0.1,
      citations: [],
      insufficientInformation: true,
    };
  }

  const topChunks = scoredChunks.filter((s) => s.score > 0).slice(0, 3);
  const primaryChunk = topChunks[0].chunk;

  // Answer generation based on evidence
  let answer = primaryChunk.text;
  if (answer.length > 400) {
    answer = answer.slice(0, 400) + '...';
  }

  const citations = topChunks.map((item) => ({
    documentTitle: item.chunk.documentId?.title || 'Event Rulebook',
    version: item.chunk.version || '1.0',
    section: item.chunk.section || 'General',
    page: item.chunk.page || 1,
    excerpt: item.chunk.text.length > 150 ? item.chunk.text.slice(0, 150) + '...' : item.chunk.text,
  }));

  return {
    answer,
    confidence: Math.min(0.98, 0.7 + topChunks.length * 0.08),
    citations,
    insufficientInformation: false,
  };
};

export default {
  queryRulebook,
};
