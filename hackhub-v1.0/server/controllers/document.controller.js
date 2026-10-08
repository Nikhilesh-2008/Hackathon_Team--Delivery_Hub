import documentService from '../services/document.service.js';
import { sendSuccess, sendCollection } from '../utils/response.js';

export const uploadDocument = async (req, res, next) => {
  try {
    const data = await documentService.uploadDocument(req.params.eventId, req.user, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getEventDocuments = async (req, res, next) => {
  try {
    const data = await documentService.getEventDocuments(req.params.eventId);
    return sendCollection(res, data, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const data = await documentService.getDocumentById(req.params.documentId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const retryDocumentProcessing = async (req, res, next) => {
  try {
    const data = await documentService.retryDocumentProcessing(req.params.documentId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const data = await documentService.deleteDocument(req.params.documentId, req.user);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default {
  uploadDocument,
  getEventDocuments,
  getDocumentById,
  retryDocumentProcessing,
  deleteDocument,
};
