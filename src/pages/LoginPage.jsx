import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2, Sparkles, User, ShieldCheck, Award, GraduationCap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <Layers size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
            HackHub
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Hackathon Team Matching & Delivery Hub
          </p>
        </div>

        {/* Demo Mode Persona Switcher Card */}
        <Card className="p-6 text-left space-y-4 shadow-sm">
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Interactive Demo Mode</h2>
              <p className="text-[11px] text-[#64748B]">Select a role to explore tailored features</p>
            </div>
            <Badge variant="primary" size="sm">Zero Setup</Badge>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleSelectRole('Participant')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-left group cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
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

        <p className="text-[11px] text-[#64748B]">
          Built with React & Tailwind CSS · Ready for future backend API attachment
        </p>
      </div>
    </div>
  );
};
