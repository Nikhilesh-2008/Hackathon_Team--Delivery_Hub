import { api } from './api';
import { apiRoutes } from './apiRoutes';

/**
 * Rulebook RAG client.
 *
 * Every answer returned here is grounded in indexed rulebook chunks for a single
 * event. When the rulebook cannot answer, the backend returns
 * `insufficientInformation: true` plus a `contact` block naming who to ask.
 */
export const rulebookService = {
  /** Events that currently have at least one indexed rulebook chunk. */
  listIndexedEvents: async () => {
    const res = await api.get(apiRoutes.rulebook.events());
    return Array.isArray(res?.data) ? res.data : [];
  },

  /** All events, used to offer organizer-side ingestion for events with no rulebook yet. */
  listAllEvents: async () => {
    const res = await api.get(apiRoutes.events.list());
    return Array.isArray(res?.data) ? res.data : [];
  },

  /** Documents already ingested for an event. */
  listDocuments: async (eventId) => {
    const res = await api.get(apiRoutes.events.documents(eventId));
    return Array.isArray(res?.data) ? res.data : [];
  },

  /** Ask the event rulebook. Body: { query }. */
  ask: async (eventId, query) => {
    const res = await api.post(apiRoutes.events.rulebookQuery(eventId), { query });
    return res?.data || null;
  },

  /**
   * Organizer ingestion: index raw rulebook text so the assistant can cite it.
   * `content` is required by the backend; chunks are derived server-side.
   */
  ingestText: async (eventId, { title, version, content }) => {
    const res = await api.post(apiRoutes.events.documents(eventId), {
      title,
      version: version || '1.0',
      sourceType: 'text',
      content,
    });
    return res?.data || null;
  },

  /** Re-embed chunks for a document (e.g. after switching embedding models). */
  retryProcessing: async (documentId) => {
    const res = await api.post(apiRoutes.documents.retry(documentId));
    return res?.data || null;
  },
};

export default rulebookService;
