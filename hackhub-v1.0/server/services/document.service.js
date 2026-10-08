import { Document, Chunk, Event, AuditLog } from '../models/index.js';
import { AppError } from '../utils/response.js';

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

  // Automatically chunk text if provided
  if (docData.content || docData.textChunks) {
    document.status = 'extracting';
    await document.save();

    const chunks = docData.textChunks || [
      {
        text: docData.content || `Official guidelines and rules for ${event.name}.`,
        section: 'General Rules',
        page: 1,
      },
    ];

    document.status = 'embedding';
    await document.save();

    for (const c of chunks) {
      await Chunk.create({
        documentId: document._id,
        eventId: event._id,
        version: document.version,
        section: c.section || 'General',
        page: c.page || 1,
        text: c.text,
        embedding: [],
      });
    }

    document.status = 'ready';
    await document.save();
  } else {
    // Mark ready for simulated ingestion
    document.status = 'ready';
    await document.save();
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

  document.status = 'ready';
  await document.save();

  return {
    retried: true,
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
};
