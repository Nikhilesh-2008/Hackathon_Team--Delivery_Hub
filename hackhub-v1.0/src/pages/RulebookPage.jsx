import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rulebookService } from '../services/rulebookService';
import {
  BookOpen,
  Bot,
  Send,
  Sparkles,
  FileText,
  CheckCircle2,
  ShieldQuestion,
  Users,
  Mail,
  Upload,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';

const SUGGESTIONS = [
  'What is the team size limit?',
  'Which deliverables must we submit?',
  'Are external APIs allowed?',
  'How is the project judged?',
  'What is the submission deadline?',
];

const asEventOption = (event) => ({
  id: event.id || event._id,
  name: event.name || event.title,
  subtitle:
    event.status === 'draft'
      ? 'Draft event'
      : event.chunkCount !== undefined
        ? `${event.documentCount} doc${event.documentCount === 1 ? '' : 's'} · ${event.chunkCount} indexed chunks`
        : event.organizerName || '',
});

const ReadinessBanner = ({ event, docsLoading, onIngest, canIngest }) => {
  if (!event) return null;

  if (docsLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
        <RefreshCw size={13} className="animate-spin" />
        <span>Checking indexed rulebook documents...</span>
      </div>
    );
  }

  if (event.chunkCount > 0) {
    return (
      <div className="flex items-start gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
        <Database size={13} className="mt-0.5 shrink-0" />
        <span>
          Grounded on <strong>{event.documentCount}</strong> indexed rulebook document
          {event.documentCount === 1 ? '' : 's'} ({event.chunkCount} chunks). Answers outside these
          documents are refused and handed to the event contact.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">No rulebook indexed for this event yet.</p>
        <p className="mt-0.5 text-amber-800">
          The assistant has no evidence to answer from, so every question is redirected to the event
          organizer.
        </p>
        {canIngest && (
          <button
            type="button"
            onClick={onIngest}
            className="mt-1.5 inline-flex items-center gap-1 font-semibold text-amber-900 underline underline-offset-2"
          >
            <Upload size={12} /> Ingest the rulebook now
          </button>
        )}
      </div>
    </div>
  );
};

const ContactCard = ({ contact }) => {
  if (!contact) return null;
  return (
    <div className="mt-2 pt-2 border-t border-slate-300/70 text-[11px] space-y-1">
      <p className="flex items-center gap-1 font-semibold text-slate-700">
        <Users size={12} /> {contact.label}
        {contact.name ? ` · ${contact.name}` : ''}
      </p>
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-1 text-indigo-700 font-medium hover:underline"
        >
          <Mail size={11} /> {contact.email}
        </a>
      ) : (
        <p className="text-slate-500">{contact.message}</p>
      )}
      {contact.contacts?.length > 1 && (
        <ul className="text-slate-500 list-disc list-inside">
          {contact.contacts.slice(1).map((c) => (
            <li key={`${c.role}-${c.email}`}>
              {c.role}
              {c.email ? `: ${c.email}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const RulebookPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [eventOptions, setEventOptions] = useState([]);
  const [indexedOptions, setIndexedOptions] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);

  const scrollRef = useRef(null);

  const canManage = ['ORGANIZER', 'ADMIN'].includes((user?.role || '').toUpperCase());

  const selectedEvent = eventOptions.find((e) => e.id === selectedEventId) || null;
  const indexedEvent = indexedOptions.find((e) => e.id === selectedEventId) || null;

  const readiness = selectedEvent
    ? {
        ...selectedEvent,
        chunkCount: indexedEvent?.chunkCount || 0,
        documentCount: indexedEvent?.documentCount || 0,
      }
    : null;

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [all, indexed] = await Promise.all([
        rulebookService.listAllEvents(),
        rulebookService.listIndexedEvents(),
      ]);

      const indexedIds = new Set(indexed.map((e) => e.id));
      const merged = [
        ...indexed.map(asEventOption),
        ...all
          .filter((e) => !indexedIds.has(e.id || e._id))
          .map(asEventOption),
      ];

      setEventOptions(merged);
      setIndexedOptions(indexed.map(asEventOption));

      setSelectedEventId((current) => {
        if (current && merged.some((e) => e.id === current)) return current;
        return (indexed[0]?.id || merged[0]?.id) ? String(indexed[0]?.id || merged[0]?.id) : '';
      });
    } catch (err) {
      showError(err.message || 'Could not load events for the rulebook assistant');
      setEventOptions([]);
      setIndexedOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const loadDocuments = useCallback(async (eventId) => {
    if (!eventId) {
      setDocuments([]);
      return;
    }
    setDocsLoading(true);
    try {
      const docs = await rulebookService.listDocuments(eventId);
      setDocuments(docs);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(selectedEventId);
  }, [selectedEventId, loadDocuments]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isAsking]);

  const runsOn = [];
  if (readiness?.chunkCount > 0) {
    runsOn.push({
      id: 'rulebook',
      title: 'Rulebook v' + (documents[0]?.version || '1.0'),
      subtitle: `${readiness.documentCount} doc(s) · ${readiness.chunkCount} chunks`,
      content: `The assistant retrieves only chunks from this event's ingested rulebook and cites the section for every answer.`,
    });
  }

  const handleAsk = async (e) => {
    e.preventDefault();
    const userText = query.trim();
    if (!userText || !selectedEventId || isAsking) return;

    setQuery('');
    setChatHistory((prev) => [...prev, { id: `u_${Date.now()}`, sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const response = await rulebookService.ask(selectedEventId, userText);

      const grounded = response?.grounded === true;
      const message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response?.answer || 'No answer was returned.',
        grounded,
        refused: !grounded,
        confidence: response?.confidence ?? 0,
        citations: response?.citations || [],
        contact: response?.contact || null,
        trace: response?.trace || null,
      };

      setChatHistory((prev) => [...prev, message]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: `The rulebook assistant could not be reached: ${err.message}`,
          grounded: false,
          refused: true,
          system: true,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !ingestTitle.trim() || !ingestContent.trim()) return;

    setIsIngesting(true);
    try {
      const doc = await rulebookService.ingestText(selectedEventId, {
        title: ingestTitle.trim(),
        content: ingestContent.trim(),
      });
      showSuccess(`"${doc?.title || ingestTitle}" indexed into the rulebook`);
      setIsIngestOpen(false);
      setIngestTitle('');
      setIngestContent('');
      await Promise.all([loadOptions(), loadDocuments(selectedEventId)]);
    } catch (err) {
      showError(err.message || 'Could not index the rulebook');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRetry = async (documentId) => {
    try {
      const res = await rulebookService.retryProcessing(documentId);
      showSuccess(`Re-embedded ${res?.reembeddedChunks ?? 0} chunk(s)`);
      await Promise.all([loadOptions(), loadDocuments(selectedEventId)]);
    } catch (err) {
      showError(err.message || 'Could not re-embed this document');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hackathon Rulebook & AI Assistant"
        subtitle="Retrieval-augmented answers grounded strictly in the official event rulebook."
        badge={<Badge variant="primary">RAG · Rulebook only</Badge>}
      >
        {canManage && (
          <Button size="sm" variant="secondary" onClick={() => setIsIngestOpen(true)} className="gap-1.5">
            <Upload size={15} />
            <span>Ingest Rulebook</span>
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: knowledge base */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                <span>Rulebook Knowledge Base</span>
              </h3>
              <button
                type="button"
                onClick={() => loadDocuments(selectedEventId)}
                className="text-xs text-[#64748B] hover:text-[#4F46E5] inline-flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]" htmlFor="rulebook-event-select">
                Event
              </label>
              <select
                id="rulebook-event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={optionsLoading || eventOptions.length === 0}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                {optionsLoading && <option value="">Loading events...</option>}
                {!optionsLoading && eventOptions.length === 0 && (
                  <option value="">No events found. Create an event first.</option>
                )}
                {eventOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                    {option.subtitle ? ` — ${option.subtitle}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <ReadinessBanner
              event={readiness}
              docsLoading={docsLoading}
              canIngest={canManage}
              onIngest={() => setIsIngestOpen(true)}
            />

            {documents.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Indexed documents
                </p>
                {documents.map((doc) => (
                  <div
                    key={doc._id || doc.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate flex items-center gap-1.5">
                        <FileText size={12} className="text-indigo-600 shrink-0" />
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        v{doc.version || '1.0'} · {doc.sourceType || 'text'} ·{' '}
                        <span
                          className={
                            doc.status === 'ready'
                              ? 'text-emerald-700 font-semibold'
                              : doc.status === 'failed'
                                ? 'text-rose-700 font-semibold'
                                : 'text-amber-700 font-semibold'
                          }
                        >
                          {doc.status}
                        </span>
                        {doc.createdAt ? ` · ${new Date(doc.createdAt).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleRetry(doc._id || doc.id)}
                        className="text-[11px] font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <RefreshCw size={11} /> Re-embed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {runsOn.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-sm text-[#172033]">{runsOn[0].title}</h4>
                <p className="text-[11px] text-slate-500">{runsOn[0].subtitle}</p>
                <p className="text-xs text-slate-700 leading-relaxed">{runsOn[0].content}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: assistant */}
        <div className="lg:col-span-5">
          <Card className="p-5 flex flex-col h-[620px] bg-white border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Ask the Rulebook</h3>
                  <p className="text-[11px] text-[#64748B]">
                    {readiness?.chunkCount > 0
                      ? 'Answers cite rulebook sections'
                      : 'No rulebook indexed yet'}
                  </p>
                </div>
              </div>
              <Badge variant={readiness?.chunkCount > 0 ? 'success' : 'default'} size="sm">
                {readiness?.chunkCount > 0 ? 'Grounded' : 'No source'}
              </Badge>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3">
              {chatHistory.length === 0 && !isAsking && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3">
                  <ShieldQuestion size={30} className="text-slate-300" />
                  <p className="text-xs text-slate-500">
                    This assistant answers <strong>only</strong> from the selected event's ingested
                    rulebook. Anything else is handed to the event contact.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[92%] whitespace-pre-line ${
                        isUser
                          ? 'bg-[#4F46E5] text-white rounded-tr-none'
                          : msg.refused
                            ? 'bg-amber-50 text-[#172033] rounded-tl-none border border-amber-200'
                            : 'bg-slate-100 text-[#172033] rounded-tl-none border border-slate-200/60'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.citations?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-300/70 space-y-1">
                          <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Cited rulebook evidence
                          </p>
                          {msg.citations.map((c, i) => (
                            <p key={`${msg.id}_cite_${i}`} className="text-[10px] text-slate-600">
                              {c.documentTitle} v{c.version} · {c.section} (p.{c.page}) ·{' '}
                              {Math.round((c.relevance || 0) * 100)}% match
                            </p>
                          ))}
                        </div>
                      )}

                      {msg.refused && <ContactCard contact={msg.contact} />}

                      {!msg.refused && msg.contact && (
                        <p className="mt-2 pt-2 border-t border-slate-300/70 text-[10px] text-slate-500">
                          Still unsure? {msg.contact.label}
                          {msg.contact.email ? ` · ${msg.contact.email}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAsking && (
                <div className="p-3 bg-slate-100 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600 animate-spin" />
                  <span>Retrieving rulebook chunks...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleAsk} className="pt-3 border-t border-[#E2E8F0] flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  selectedEventId ? 'Ask about eligibility, deliverables, judging...' : 'Select an event first'
                }
                disabled={!selectedEventId || isAsking}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:bg-white disabled:opacity-60"
              />
              <Button type="submit" variant="primary" size="sm" disabled={isAsking || !selectedEventId || !query.trim()}>
                <Send size={14} />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <Modal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} title="Ingest Rulebook Text">
        <form onSubmit={handleIngest} className="space-y-4">
          <p className="text-xs text-slate-600">
            Paste the official rulebook. Sections are split and embedded on the server so the
            assistant can cite them.
          </p>
          {!selectedEventId && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              Select an event first.
            </p>
          )}
          <Input
            label="Document title"
            value={ingestTitle}
            onChange={(e) => setIngestTitle(e.target.value)}
            placeholder="e.g. NexusHack 2026 Official Rulebook"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Rulebook text</label>
            <textarea
              rows={10}
              value={ingestContent}
              onChange={(e) => setIngestContent(e.target.value)}
              placeholder={'1.0 Eligibility\nAll undergraduate students may participate.\n\n2.0 Team Size\nTeams must have 2 to 4 members.'}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5] font-mono"
              required
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setIsIngestOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isIngesting || !selectedEventId || !ingestContent.trim() || !ingestTitle.trim()}
            >
              {isIngesting ? 'Indexing...' : 'Index Rulebook'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RulebookPage;
