import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layers, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';

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
    role: 'PARTICIPANT',
  });
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

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(values);
        navigate('/login', {
          state: {
            registered: true,
            email: values.email,
            message: 'Account created successfully! Please sign in with your email and password.',
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
      <section className="w-full max-w-md">
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
                <label className="block text-sm font-medium text-slate-700">
                  College / Organization
                  <input className={`${fieldClass} mt-1.5`} name="college" autoComplete="organization" value={values.college} onChange={update} />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Graduation year / department
                  <input className={`${fieldClass} mt-1.5`} name="graduationYear" value={values.graduationYear} onChange={update} />
                </label>
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
