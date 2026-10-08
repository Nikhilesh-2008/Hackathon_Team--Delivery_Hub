import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { mockReputationHistory } from '../data/reputation';
import {
  Award,
  Trophy,
  Star,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const ReputationPage = () => {
  const { user } = useAuth();

  const achievements = [
    { title: "Winner (1st Place)", event: "AI Innovation Challenge 2025", desc: "Top score across 120 collegiate teams with CodeMentor AI.", icon: Trophy, color: "text-amber-500 bg-amber-50" },
    { title: "National Finalist", event: "Smart India Hackathon Internal", desc: "Selected for national stage in smart agriculture.", icon: Award, color: "text-indigo-600 bg-indigo-50" },
    { title: "Verified Deliverer", event: "GitHub Open Source", desc: "100% submission rate on all joined collegiate sprints.", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hackathon Reputation Score"
        subtitle="Transparent scoring built on delivered open-source code, placements, and peer reliability."
      />

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            Top 5% Collegiate Developer
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#172033]">
            {user?.reputation || 1250} <span className="text-lg font-normal text-[#64748B]">Reputation Points</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl leading-relaxed">
            Reputation determines candidate matchmaking priority and team compatibility rankings across hackathons.
          </p>
        </div>

        <div className="w-28 h-28 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col items-center justify-center text-indigo-700 shrink-0">
          <Award size={40} className="text-[#4F46E5] mb-1" />
          <span className="text-xs font-bold">Tier: Master</span>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div>
        <h3 className="text-base font-bold text-[#172033] mb-3">Honors & Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((ach, i) => {
            const Icon = ach.icon;
            return (
              <Card key={i} className="p-5 flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ach.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172033]">{ach.title}</h4>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">{ach.event}</p>
                  <p className="text-xs text-[#64748B] mt-1 leading-snug">{ach.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Point Earning History */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0] mb-4">
          How Your Reputation Was Earned
        </h3>

        <div className="space-y-4">
          {mockReputationHistory.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#172033]">{item.event}</h4>
                  <Badge variant="primary" size="sm">{item.type}</Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1">{item.description}</p>
              </div>

              <div className="text-right sm:text-right flex items-center justify-between sm:flex-col shrink-0">
                <span className="text-base font-bold text-emerald-600">{item.points} pts</span>
                <span className="text-[11px] text-slate-400">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
