import { Document, Chunk, Event, AuditLog } from '../models/index.js';
import { AppError } from '../utils/response.js';
import { embedText, EMBEDDING_MODEL } from '../utils/embedding.js';

/**
 * Split raw rulebook text into retrieval-sized chunks that keep section context.
 * Explicit `textChunks` always win; otherwise we derive chunks from the plain
 * text using blank lines and "N.N Heading" markers, then window long blocks.
 */
export const splitIntoChunks = (rawText, fallbackTitle = 'General Rules') => {
  const text = String(rawText || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
  const chunks = [];
  let currentSection = fallbackTitle;

  // A block may be "N.N Heading" alone, or "N.N Heading" followed by its body on
  // later lines. Only the FIRST line is tested so bodies are never mistaken for headings.
  const HEADING_RE = /^(?:#{1,6}\s*)?(\d+(?:\.\d+)*)[.)]?\s+(.{2,120})$/;

  for (const block of blocks) {
    const firstNewline = block.indexOf('\n');
    const firstLine = (firstNewline >= 0 ? block.slice(0, firstNewline) : block).trim();
    const rest = firstNewline >= 0 ? block.slice(firstNewline + 1).trim() : '';
    const headingMatch = firstLine.match(HEADING_RE);

    if (headingMatch) {
      currentSection = `${headingMatch[1]} ${headingMatch[2]}`.replace(/\s+/g, ' ').trim();
      if (rest) chunks.push({ text: rest, section: currentSection });
      continue;
    }

    if (block.length <= 1200) {
      chunks.push({ text: block, section: currentSection });
    } else {
      const sentences = block.split(/(?<=[.!?])\s+/);
      let buffer = '';
      for (const sentence of sentences) {
        if ((buffer + ' ' + sentence).trim().length > 900 && buffer) {
          chunks.push({ text: buffer.trim(), section: currentSection });
          buffer = sentence;
        } else {
          buffer = `${buffer} ${sentence}`.trim();
        }
      }
      if (buffer.trim()) chunks.push({ text: buffer.trim(), section: currentSection });
    }
  }

  return chunks;
};

export const uploadDocument = async (eventId, user, docData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  if (user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can upload rulebook documents', 403);
  }

  const document = await Document.create({
    eventId: event._id,
    title: docData.title,
    version: docData.version || '1.0',
    sourceType: docData.sourceType || 'pdf',
    sourceUrl: docData.sourceUrl || '',
    fileSize: docData.fileSize || 1024 * 50,
    status: 'uploaded',
    uploadedBy: user._id,
  });

  // Chunk + embed whenever any rulebook text arrives with the document.
  if (docData.content || (Array.isArray(docData.textChunks) && docData.textChunks.length > 0)) {
    document.status = 'extracting';
    await document.save();

    const rawChunks = Array.isArray(docData.textChunks) && docData.textChunks.length > 0
      ? docData.textChunks
          .map((c) => ({
            text: String(c.text || '').trim(),
            section: c.section || 'General',
            page: c.page || 1,
          }))
          .filter((c) => c.text.length > 0)
      : splitIntoChunks(docData.content, `${event.name} Rulebook`);

    if (rawChunks.length === 0) {
      document.status = 'failed';
      await document.save();
      throw new AppError('VALIDATION_ERROR', 'No usable rulebook text could be extracted from this document', 400);
    }

    document.status = 'embedding';
    await document.save();

    // Replace any previous chunks so a re-upload cannot leave stale evidence behind.
    await Chunk.deleteMany({ documentId: document._id });

    for (const c of rawChunks) {
      await Chunk.create({
        documentId: document._id,
        eventId: event._id,
        version: document.version,
        section: c.section || 'General',
        page: c.page || 1,
        text: c.text,
        embedding: embedText(c.text),
        embeddingModel: EMBEDDING_MODEL,
        embeddingVersion: '1',
      });
    }

    document.status = 'ready';
    await document.save();
  } else {
    // No text supplied: nothing to retrieve from, so do not pretend it is ready.
    document.status = 'failed';
    await document.save();
    throw new AppError(
      'VALIDATION_ERROR',
      'Rulebook documents need `content` text (or `textChunks`) so the RAG pipeline has something to index',
      400
    );
  }

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'DOCUMENT_UPLOADED',
    entityType: 'Document',
    entityId: document._id,
    reason: 'Rulebook document ingested',
  });

  return document;
};

export const getEventDocuments = async (eventId) => {
  const documents = await Document.find({ eventId }).sort({ createdAt: -1 });
  return documents;
};

export const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId).populate('uploadedBy', 'name email');
  if (!document) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Document not found', 404);
  }

  const chunkCount = await Chunk.countDocuments({ documentId: document._id });

  return {
    document,
    chunkCount,
  };
};

export const retryDocumentProcessing = async (documentId, user) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Document not found', 404);
  }

  const event = await Event.findById(document.eventId);
  if (event && user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can retry document processing', 403);
  }

  // Recompute embeddings for every chunk that is missing them (or was written by an
  // older embedding model) so retrieval never silently degrades to keyword-only.
  const chunks = await Chunk.find({ documentId: document._id });
  let reembedded = 0;

  for (const chunk of chunks) {
    const needsEmbedding =
      !Array.isArray(chunk.embedding) ||
      chunk.embedding.length === 0 ||
      chunk.embeddingModel !== EMBEDDING_MODEL;

    if (needsEmbedding) {
      chunk.embedding = embedText(chunk.text);
      chunk.embeddingModel = EMBEDDING_MODEL;
      chunk.embeddingVersion = '1';
      await chunk.save();
      reembedded += 1;
    }
  }

  document.status = chunks.length > 0 ? 'ready' : 'failed';
  await document.save();

  return {
    retried: true,
    reembeddedChunks: reembedded,
    totalChunks: chunks.length,
    document,
  };
};

export const deleteDocument = async (documentId, user) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Document not found', 404);
  }

  const event = await Event.findById(document.eventId);
  if (event && user.role !== 'ADMIN' && event.organizerId.toString() !== user._id.toString()) {
    throw new AppError('FORBIDDEN', 'Only event organizer or admin can delete documents', 403);
  }

  await Chunk.deleteMany({ documentId: document._id });
  await Document.findByIdAndDelete(documentId);

  return {
    deleted: true,
    documentId,
  };
};

export default {
  uploadDocument,
  getEventDocuments,
  getDocumentById,
  retryDocumentProcessing,
  deleteDocument,
  splitIntoChunks,
};
