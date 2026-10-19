import { Profile, Certificate } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const addCertificate = async (userId, file, { title, issuer, date }) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Profile not found', 404);
  }

  if (!file) {
    throw new AppError('VALIDATION_ERROR', 'No certificate file uploaded', 400);
  }

  const certificate = await Certificate.create({
    title: title.trim(),
    issuer: issuer.trim(),
    date: date || new Date().toISOString().split('T')[0],
    fileUrl: `/api/uploads/certificates/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  });

  profile.certificates = profile.certificates || [];
  profile.certificates.push(certificate.toObject());
  await profile.save();

  return {
    id: certificate._id,
    title: certificate.title,
    issuer: certificate.issuer,
    date: certificate.date,
    fileUrl: certificate.fileUrl,
    originalName: certificate.originalName,
    mimeType: certificate.mimeType,
    size: certificate.size,
  };
};

export const removeCertificate = async (userId, certificateId) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Profile not found', 404);
  }

  const certificate = profile.certificates?.find((c) => c._id?.toString() === certificateId);
  if (!certificate) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Certificate not found', 404);
  }

  profile.certificates = profile.certificates.filter((c) => c._id?.toString() !== certificateId);
  await profile.save();

  return {
    id: certificate._id,
    title: certificate.title,
    status: 'removed',
  };
};

export default { addCertificate, removeCertificate };
