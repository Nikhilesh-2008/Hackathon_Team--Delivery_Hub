import React, { useEffect, useState } from 'react';
import { Paperclip, LoaderCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

const MAX_BYTES = 5 * 1024 * 1024;

export const UploadCertificateModal = ({ isOpen, onClose, onUploaded }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setIssuer('');
      setDate('');
      setFile(null);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setError('');
    if (selected && selected.size > MAX_BYTES) {
      setError('Certificate file must be 5 MB or smaller.');
      setFile(null);
      return;
    }
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.[^.]+$/, ''));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose a PDF or image file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('title', title.trim());
    formData.append('issuer', issuer.trim());
    formData.append('date', date.trim());

    try {
      setIsSubmitting(true);
      setError('');
      const response = await api.upload('/profiles/me/certificates', formData);
      onUploaded?.(response.data);
      onClose();
    } catch (uploadError) {
      setError(uploadError.message || 'Certificate upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Certificate">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Certificate title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. AWS Cloud Practitioner"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Issuing organization"
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            placeholder="e.g. Amazon Web Services"
            required
          />
          <Input
            label="Date (optional)"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            placeholder="e.g. 2026"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5">Certificate file</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-4 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/40">
            <Paperclip size={14} />
            <span>{file ? file.name : 'Choose PDF, PNG, JPG, or WEBP (max 5 MB)'}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFile}
              className="hidden"
              required
            />
          </label>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle size={14} className="animate-spin" />}
            {isSubmitting ? 'Uploading…' : 'Upload certificate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadCertificateModal;
