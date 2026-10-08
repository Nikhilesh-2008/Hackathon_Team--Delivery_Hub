import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, User, ShieldCheck, GraduationCap, Lock, Mail, Sparkles, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { switchRole, login, register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('demo'); // 'demo' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Participant');
  const [specialization, setSpecialization] = useState('Backend Developer');
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (selectedRole) => {
    switchRole(selectedRole);
    navigate('/dashboard');
  };

  const handleRealLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRealRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showError('Please complete all required fields');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role, specialization });
      showSuccess('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-5 text-center">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <Layers size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
            HackHub
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Hackathon Team Matching & Delivery Platform
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center bg-slate-200/70 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('demo')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'demo' ? 'bg-white text-[#172033] shadow-xs' : 'text-slate-600 hover:text-[#172033]'
            }`}
          >
            Demo Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-[#172033] shadow-xs' : 'text-slate-600 hover:text-[#172033]'
            }`}
          >
            Account Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-[#172033] shadow-xs' : 'text-slate-600 hover:text-[#172033]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Mode 1: Quick Demo Personas */}
        {mode === 'demo' && (
          <Card className="p-5 text-left space-y-3.5 shadow-sm">
            <div className="pb-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#172033]">Instant Persona Entry</h2>
                <p className="text-[11px] text-[#64748B]">Click any role to enter with mock credentials</p>
              </div>
              <Badge variant="primary" size="sm">One-Click</Badge>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleSelectRole('Participant')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">Continue as Participant</p>
                    <p className="text-[11px] text-slate-500">Karthik (Backend Developer · Team Nova)</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSelectRole('Mentor')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">Continue as Mentor</p>
                    <p className="text-[11px] text-slate-500">Dr. Arvind Rao (Feedback & Blockers)</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSelectRole('Judge')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">Continue as Industry Judge</p>
                    <p className="text-[11px] text-slate-500">Siddharth Sen (Rubric & Scoring)</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSelectRole('Organizer')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">Continue as Organizer</p>
                    <p className="text-[11px] text-slate-500">Aakash Mehta (Event & Track Manager)</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </Card>
        )}

        {/* Mode 2: Real JWT Email & Password Login */}
        {mode === 'login' && (
          <Card className="p-5 text-left space-y-4 shadow-sm">
            <div className="pb-2 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-bold text-[#172033]">Account Login</h2>
              <p className="text-[11px] text-[#64748B]">Enter your registered credentials</p>
            </div>

            <form onSubmit={handleRealLogin} className="space-y-3">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="karthik.dev@college.edu"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>
          </Card>
        )}

        {/* Mode 3: Real JWT User Registration */}
        {mode === 'register' && (
          <Card className="p-5 text-left space-y-4 shadow-sm">
            <div className="pb-2 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-bold text-[#172033]">Create Student Profile</h2>
              <p className="text-[11px] text-[#64748B]">Join hackathons & build with student squads</p>
            </div>

            <form onSubmit={handleRealRegister} className="space-y-3">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Karthik"
                required
              />

              <Input
                label="College Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Participant">Participant</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Judge">Judge</option>
                    <option value="Organizer">Organizer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="Frontend Developer">Frontend Dev</option>
                    <option value="Backend Developer">Backend Dev</option>
                    <option value="AI/ML Developer">AI/ML Dev</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="DevOps Developer">DevOps Dev</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
              >
                Create Account
              </Button>
            </form>
          </Card>
        )}

        <p className="text-[11px] text-[#64748B]">
          HackHub v1.0 · React + Node.js + Express + MongoDB Atlas
        </p>
      </div>
    </div>
  );
};
