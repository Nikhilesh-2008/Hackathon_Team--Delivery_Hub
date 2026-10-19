import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { AppError } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
export const CERTIFICATE_DIR = path.join(UPLOAD_ROOT, 'certificates');

fs.mkdirSync(CERTIFICATE_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CERTIFICATE_DIR),
  filename: (req, file, cb) => {
    const original = path.basename(file.originalname || 'certificate');
    const ext = path.extname(original).toLowerCase().slice(0, 10) || '';
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

export const certificateUploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Only PDF, PNG, JPG, or WEBP certificate files are allowed'));
    }
    return cb(null, true);
  },
});

export const CERTIFICATE_URL_PREFIX = '/api/uploads/certificates';
export const CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024;

// Translate multer failures (size/type) into 4xx errors the API can report cleanly
export const handleCertificateUpload = (req, res, next) => {
  certificateUploader.single('certificate')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('FILE_TOO_LARGE', 'Certificate file must be 5 MB or smaller', 413));
    }
    return next(new AppError('VALIDATION_ERROR', err.message || 'Certificate upload failed', 400));
  });
};

export default certificateUploader;
