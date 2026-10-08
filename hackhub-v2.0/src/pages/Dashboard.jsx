import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  CheckSquare,
  Plus
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { HackathonCard } from '../components/events/HackathonCard';
import { CandidateCard } from '../components/team/CandidateCard';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { mockEventService } from '../services/mockEventService';
import { mockProfileService } from '../services/mockProfileService';

export const Dashboard = () => {
  const { user, activeRole } = useAuth();
  const { currentTeam, tasks, updateTaskStatus, sendInvitation } = useTeam();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const events = await mockEventService.getAllHackathons();
      const candidates = await mockProfileService.getCandidates();
      setUpcomingEvents(events.slice(0, 2));
      setRecommendedCandidates(candidates.slice(0, 3));
    };
    fetchData();
  }, []);

  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const recentTasks = tasks.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            Good evening, {user?.name || 'Karthik'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Here's what's happening with your hackathon journey and team delivery.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <NavLink to="/team-finder">
            <Button size="sm" variant="secondary">
              <Users size={15} />
              <span>Find Teammates</span>
            </Button>
          </NavLink>
          <NavLink to="/events">
            <Button size="sm" variant="primary">
              <Calendar size={15} />
              <span>Explore Events</span>
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          label="Reputation Score"
          value={user?.reputation || 1250}
          trend="+15"
          trendLabel="this sprint"
          icon={Award}
          color="indigo"
        />
        <StatCard
          label="Hackathons Joined"
          value="6"
          trendLabel="3 Medals Won"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          label="Projects Delivered"
          value="8"
          trendLabel="All open source"
          icon={Layers}
          color="sky"
        />
        <StatCard
          label="Current Team"
          value={`${currentTeam?.members?.length || 4} Members`}
          trendLabel="Team Nova"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Urgent Highlight Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-amber-950">
                NexusHack 2026 Submission Deadline Approaching
              </h4>
              <Badge variant="warning" size="sm">28h Left</Badge>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-0.5">
              Team Nova is currently at 72% progress. Missing: Demo video walkthrough and Render deployment unblocking.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/ai-planner">
            <Button size="sm" variant="secondary" className="border-amber-300 text-amber-900 hover:bg-amber-100">
              <Sparkles size={14} />
              <span>AI Delivery Plan</span>
            </Button>
          </NavLink>
          <NavLink to="/team/submission">
            <Button size="sm" variant="primary" className="bg-amber-700 hover:bg-amber-800">
              Submit Now
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Main Grid: Team Workspace + Sprint Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team Workspace Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Team Widget */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Current Active Sprint
                  </span>
                  <Badge variant="success" size="sm">72% Completed</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#172033] mt-1">
                  {currentTeam?.name || 'Team Nova'} · {currentTeam?.challengeTitle || 'Adaptive Study Engine'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {currentTeam?.hackathonTitle}
                </p>
              </div>
              <NavLink to="/team">
                <Button size="sm" variant="secondary">
                  Team Hub
                </Button>
              </NavLink>
            </div>

            <div className="py-4">
              <ProgressBar value={currentTeam?.progress || 72} showLabel size="md" color="primary" />
            </div>

            {/* Team Members List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {currentTeam?.members?.map((member) => (
                <div key={member.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <Avatar name={member.name} size="md" className="mb-2" />
                  <p className="text-xs font-bold text-[#172033] truncate w-full">{member.name}</p>
                  <p className="text-[10px] text-[#64748B] truncate w-full">{member.role}</p>
                  {member.isCaptain && (
                    <Badge variant="primary" size="sm" className="mt-1.5 text-[9px]">Captain</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Tasks List */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Active Sprint Tasks</h3>
                <p className="text-xs text-[#64748B]">
                  {completedTasksCount} of {tasks.length} tasks finished
                </p>
              </div>
              <NavLink to="/team/tasks">
                <Button size="sm" variant="tertiary" className="text-xs text-[#4F46E5]">
                  <span>View All ({tasks.length})</span>
                  <ArrowRight size={13} />
                </Button>
              </NavLink>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => updateTaskStatus(t.id, t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        t.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {t.status === 'COMPLETED' && <CheckCircle2 size={13} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-medium truncate ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-[#172033]'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                        <span>Assigned to <strong className="text-slate-700">{t.owner}</strong></span>
                        <span>•</span>
                        <span className="text-amber-600 font-medium">Due {t.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      t.status === 'COMPLETED' ? 'success' :
                      t.status === 'IN_PROGRESS' ? 'primary' :
                      t.status === 'BLOCKED' ? 'danger' : 'default'
                    }
                    size="sm"
                  >
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Recommended Teammates */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#172033] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-600" />
                  Recommended Peers
                </h3>
                <p className="text-xs text-[#64748B]">Matched for your open tracks</p>
              </div>
              <NavLink to="/team-finder">
                <Button size="sm" variant="tertiary" className="text-xs text-[#4F46E5] p-0">
                  Explore
                </Button>
              </NavLink>
            </div>

            <div className="space-y-3 pt-3">
              {recommendedCandidates.map((candidate) => (
                <div key={candidate.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={candidate.name} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-[#172033] leading-tight">{candidate.name}</p>
                        <p className="text-[11px] text-[#64748B]">{candidate.specialization}</p>
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">{candidate.matchScore}% Match</Badge>
                  </div>

                  <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 mt-2 mb-2 line-clamp-1">
                    ✓ {candidate.whyThisPerson.skillsMatch}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <NavLink to={`/profile/${candidate.id}`} className="text-[#4F46E5] hover:underline font-medium text-[11px]">
                      View Profile
                    </NavLink>
                    <Button
                      size="sm"
                      variant="primary"
                      className="px-2.5 py-1 text-[11px] h-7"
                      onClick={() => sendInvitation(candidate.id, "Hey, let's team up!")}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Featured Hackathons Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#172033]">Upcoming Hackathons</h2>
            <p className="text-xs text-[#64748B]">Challenges worth building for this semester</p>
          </div>
          <NavLink to="/events">
            <Button size="sm" variant="secondary">
              <span>View All ({upcomingEvents.length + 3})</span>
              <ArrowRight size={14} />
            </Button>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {upcomingEvents.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      </div>
    </div>
  );
};
