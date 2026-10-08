import { Router } from 'express';
import * as documentController from '../controllers/document.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();

// POST /api/events/:eventId/documents
router.post(
  '/events/:eventId/documents',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  requireFields('title'),
  documentController.uploadDocument
);

// GET /api/events/:eventId/documents
router.get('/events/:eventId/documents', requireAuth, documentController.getEventDocuments);

// GET /api/documents/:documentId
router.get('/documents/:documentId', requireAuth, documentController.getDocumentById);

// POST /api/documents/:documentId/retry
router.post(
  '/documents/:documentId/retry',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  documentController.retryDocumentProcessing
);

// DELETE /api/documents/:documentId
router.delete(
  '/documents/:documentId',
  requireAuth,
  requireRole('ORGANIZER', 'ADMIN'),
  documentController.deleteDocument
);

export default router;
