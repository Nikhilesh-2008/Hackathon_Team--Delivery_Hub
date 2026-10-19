import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { handleCertificateUpload } from '../middleware/upload.js';

const router = Router();

// GET /api/profiles/me
router.get('/profiles/me', requireAuth, profileController.getMyProfile);

// PATCH /api/profiles/me
router.patch('/profiles/me', requireAuth, profileController.updateMyProfile);

// POST /api/profiles/me/certificates (multipart/form-data: certificate file + title, issuer, date)
router.post(
  '/profiles/me/certificates',
  requireAuth,
  handleCertificateUpload,
  profileController.addCertificate
);

// DELETE /api/profiles/me/certificates/:certificateId
router.delete(
  '/profiles/me/certificates/:certificateId',
  requireAuth,
  profileController.removeCertificate
);

// GET /api/profiles/:id
router.get('/profiles/:id', profileController.getProfileById);

export default router;
