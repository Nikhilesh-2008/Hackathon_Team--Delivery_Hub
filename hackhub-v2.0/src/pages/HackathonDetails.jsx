import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { useToast } from '../context/ToastContext';
import { mockEventService } from '../services/mockEventService';

export const HackathonDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('challenges');
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const data = await mockEventService.getHackathonById(id || "hack_nexus_2026");
      setEvent(data);
    };
    fetch();
  }, [id]);

  if (!event) return <div className="p-8 text-center text-slate-500">Loading hackathon details...</div>;

  const tabs = [
    { id: 'challenges', label: `Challenges (${event.challenges?.length || 0})` },
    { id: 'rules', label: 'Rules & Guidelines' },
    { id: 'judging', label: 'Judging Criteria' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <NavLink to="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors">
        <ArrowLeft size={14} />
        <span>Back to all hackathons</span>
      </NavLink>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={event.status === 'Active' ? 'success' : 'primary'}>
                {event.status} Hackathon
              </Badge>
              <Badge variant="warning">{event.registrationStatus} Registration</Badge>
              <span className="text-xs font-semibold text-[#64748B]">{event.organizer}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              {event.title}
            </h1>

            <p className="text-sm text-[#64748B] leading-relaxed">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-indigo-600" />
                <span>Sprint: <strong>{event.startDate} - {event.endDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-indigo-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={15} className="text-amber-500" />
                <span>Prize Pool: <strong className="text-emerald-700">{event.prizePool}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => showSuccess("Registered for hackathon! Now create or join a team.")}
            >
              Join Hackathon
            </Button>
            <NavLink to="/team-finder">
              <Button variant="secondary" size="md" className="w-full">
                Find Teammates
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Challenges List */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {event.challenges?.map((chal) => (
            <Card key={chal.id} className="p-5 flex flex-col justify-between hover:border-indigo-200 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="primary" size="sm">{chal.track}</Badge>
                  <span className="text-[11px] text-slate-500 font-medium">{chal.teamRequirements}</span>
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-2">{chal.title}</h3>
                <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{chal.problemStatement}</p>
                
                <div className="space-y-1.5 mb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {chal.recommendedSkills?.map(s => (
                      <Badge key={s} variant="default" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-amber-700 font-medium">Due {chal.deadline}</span>
                <NavLink to={`/team-finder?skill=${chal.recommendedSkills?.[0] || 'React'}`}>
                  <Button size="sm" variant="secondary" className="gap-1.5">
                    <span>Find Teammates</span>
                    <ArrowRight size={13} />
                  </Button>
                </NavLink>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Rules */}
      {activeTab === 'rules' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#172033]">Official Rulebook & Code of Conduct</h3>
              <p className="text-xs text-[#64748B]">Rulebook v2 · Enforced by organizing committee</p>
            </div>
            <NavLink to="/rulebook">
              <Button size="sm" variant="ghost" className="gap-1">
                <Sparkles size={14} />
                <span>Ask Rulebook AI</span>
              </Button>
            </NavLink>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {event.rules?.map((rule) => (
              <div key={rule.id} className="pt-3 first:pt-0">
                <h4 className="text-sm font-bold text-[#172033]">
                  {rule.section} {rule.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Judging Criteria */}
      {activeTab === 'judging' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {event.judgingCriteria?.map((crit, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[#172033]">{crit.criteria}</h4>
                <Badge variant="primary">{crit.weight}</Badge>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{crit.desc}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
