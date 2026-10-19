import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layers, LoaderCircle, Paperclip, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MultiSelect } from '../components/ui/MultiSelect';
import { SearchSelect } from '../components/ui/SearchSelect';
import { api, setAuthToken } from '../services/api';
import {
  COLLEGES,
  SKILL_OPTIONS,
  TRACK_OPTIONS,
  AVAILABILITY_OPTIONS,
  SPECIALIZATION_OPTIONS,
} from '../data/options';

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';
const CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024;

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const { login, register, user, isLoading } = useAuth();
  const [values, setValues] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    college: '',
    graduationYear: '',
    specialization: 'Generalist',
    availability: '8-10 hrs/week',
    role: 'PARTICIPANT',
  });
  const [skills, setSkills] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Checking your session…</div>;
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (event) => {
    setError('');
    setSuccess('');
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCertificateFiles = (event) => {
    const incoming = Array.from(event.target.files || []);
    setError('');
    const tooLarge = incoming.filter((file) => file.size > CERTIFICATE_MAX_BYTES);
    if (tooLarge.length > 0) {
      setError(`These files exceed the 5 MB limit: ${tooLarge.map((file) => file.name).join(', ')}`);
    }
    const accepted = incoming.filter((file) => file.size <= CERTIFICATE_MAX_BYTES);
    setCertificateFiles((current) => {
      const names = new Set(current.map((file) => file.name));
      return [...current, ...accepted.filter((file) => !names.has(file.name))];
    });
    event.target.value = '';
  };

  const uploadCertificates = async (token) => {
    if (certificateFiles.length === 0) return { uploaded: 0, failed: [] };

    setAuthToken(token);
    let uploaded = 0;
    const failed = [];
    for (const file of certificateFiles) {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('title', file.name.replace(/\.[^.]+$/, ''));
      formData.append('issuer', values.college || 'Personal upload');
      formData.append('date', String(new Date().getFullYear()));
      try {
        await api.upload('/profiles/me/certificates', formData);
        uploaded += 1;
      } catch (uploadError) {
        failed.push(`${file.name} (${uploadError.message})`);
      }
    }
    setAuthToken(null);
    return { uploaded, failed };
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await register({
          ...values,
          skills,
          interests: tracks,
        });

        const { uploaded, failed } = await uploadCertificates(result?.token);
        const certificateNote = uploaded > 0
          ? ` ${uploaded} certificate${uploaded === 1 ? '' : 's'} uploaded.`
          : '';
        const failureNote = failed.length > 0
          ? ` Certificate upload failed for: ${failed.join(', ')}. You can retry from your profile.`
          : '';

        navigate('/login', {
          state: {
            registered: true,
            email: values.email,
            message: `Account created successfully!${certificateNote} Please sign in with your email and password.${failureNote}`,
          },
          replace: true,
        });
      } else {
        await login({ email: values.email, password: values.password });
        navigate('/dashboard', { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect to HackHub. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className={`w-full ${isRegister ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm"><Layers size={24} /></div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">HackHub</h1>
          <p className="mt-1 text-sm text-slate-500">Hackathon Team Matching &amp; Delivery Hub</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">{isRegister ? 'Create your account' : 'Sign in to HackHub'}</h2>
          <p className="mt-1 text-sm text-slate-500">{isRegister ? 'Join your team and start building.' : 'Use your registered email and password.'}</p>

          {success && !isRegister && (
            <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Full name
                    <input className={`${fieldClass} mt-1.5`} name="name" autoComplete="name" value={values.name} onChange={update} required minLength={2} maxLength={100} />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Choose your role
                    <select className={`${fieldClass} mt-1.5`} name="role" value={values.role} onChange={update}>
                      <option value="PARTICIPANT">Participant</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="JUDGE">Judge</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchSelect
                    label="College / University"
                    options={COLLEGES}
                    value={values.college}
                    onChange={(next) => setValues((current) => ({ ...current, college: next }))}
                    placeholder="Select your college"
                    searchPlaceholder="Search colleges…"
                    allowCustom
                    helperText="Pick from the list or type your college name."
                  />
                  <label className="block text-sm font-medium text-slate-700">
                    Graduation year / department
                    <input className={`${fieldClass} mt-1.5`} name="graduationYear" value={values.graduationYear} onChange={update} placeholder="e.g. 2027, 3rd Year CSE" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Primary specialization
                    <select className={`${fieldClass} mt-1.5`} name="specialization" value={values.specialization} onChange={update}>
                      {SPECIALIZATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Weekly availability
                    <select className={`${fieldClass} mt-1.5`} name="availability" value={values.availability} onChange={update}>
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <MultiSelect
                  label="Skills & technologies"
                  options={SKILL_OPTIONS}
                  value={skills}
                  onChange={setSkills}
                  placeholder="Select your skills"
                  searchPlaceholder="Search skills…"
                  helperText="Select everything you can contribute to a team."
                />

                <MultiSelect
                  label="Preferred tracks"
                  options={TRACK_OPTIONS}
                  value={tracks}
                  onChange={setTracks}
                  placeholder="Select hackathon tracks"
                  searchPlaceholder="Search tracks…"
                />

                <div>
                  <label className="block text-xs font-semibold text-[#172033]">Certificates (optional)</label>
                  <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                    <Paperclip size={14} />
                    <span>Upload certificates (PDF, PNG, JPG, WEBP · max 5 MB each)</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleCertificateFiles}
                      className="hidden"
                    />
                  </label>
                  {certificateFiles.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {certificateFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setCertificateFiles((current) => current.filter((item) => item !== file))}
                            className="text-slate-400 hover:text-red-600"
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input className={`${fieldClass} mt-1.5`} name="email" type="email" autoComplete="email" value={values.email} onChange={update} required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input className={`${fieldClass} mt-1.5`} name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={values.password} onChange={update} required minLength={6} />
            </label>
            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting && <LoaderCircle size={16} className="animate-spin" />}
              {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : 'New to HackHub?'}{' '}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
