import certificateService from '../services/certificate.service.js';
import { sendSuccess } from '../utils/response.js';

export const addCertificate = async (req, res, next) => {
  try {
    const data = await certificateService.addCertificate(req.user._id, req.file, req.body);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const removeCertificate = async (req, res, next) => {
  try {
    const data = await certificateService.removeCertificate(req.user._id, req.params.certificateId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    return next(err);
  }
};

export default { addCertificate, removeCertificate };
