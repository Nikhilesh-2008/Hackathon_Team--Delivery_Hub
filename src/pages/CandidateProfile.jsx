import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  Code2 as Github,
  Globe,
  Code,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { useTeam } from '../context/TeamContext';
import { mockProfileService } from '../services/mockProfileService';

export const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteNote, setInviteNote] = useState('');
  const { sendInvitation } = useTeam();

  useEffect(() => {
    const fetch = async () => {
      const data = await mockProfileService.getCandidateById(id || "usr_rahul");
      setCandidate(data);
    };
    fetch();
  }, [id]);

  if (!candidate) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Skills' },
    { id: 'projects', label: `Projects (${candidate.projects?.length || 0})` },
    { id: 'reputation', label: 'Reputation Breakdown' },
  ];

  return (
    <div className="space-y-6">
      <NavLink to="/team-finder" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033]">
        <ArrowLeft size={14} />
        <span>Back to Team Finder</span>
      </NavLink>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar name={candidate.name} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#172033]">
                  {candidate.name}
                </h1>
                <Badge variant="primary">{candidate.specialization}</Badge>
                {candidate.matchScore && (
                  <Badge variant="success" size="sm">
                    {candidate.matchScore}% Match
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#64748B] mt-1 flex items-center gap-2">
                <GraduationCap size={15} className="text-slate-400" />
                <span>{candidate.college} · {candidate.year}</span>
              </p>

              <p className="text-xs sm:text-sm text-slate-700 mt-3 max-w-2xl leading-relaxed">
                {candidate.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                  <Award size={14} />
                  <span>Reputation: <strong>{candidate.reputation}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  <Clock size={14} />
                  <span>Availability: <strong>{candidate.availability}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setInviteNote(`Hi ${candidate.name}, let's build together for NexusHack 2026!`);
              setIsInviteOpen(true);
            }}
            className="gap-2 shrink-0 self-start"
          >
            <Send size={15} />
            <span>Invite to Team</span>
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Overview & Skills */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Why this person + Skills + Interests */}
          <div className="md:col-span-2 space-y-6">
            {candidate.whyThisPerson && (
              <Card className="p-5 bg-emerald-50/60 border-emerald-200/80">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5 mb-3">
                  <Sparkles size={16} className="text-emerald-600" />
                  Why is this person recommended for your team?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900">Technical Fit</p>
                    <p className="text-slate-600 mt-0.5">{candidate.whyThisPerson.skillsMatch}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900">Domain Interest</p>
                    <p className="text-slate-600 mt-0.5">{candidate.whyThisPerson.interestMatch}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900">Hackathon Track Record</p>
                    <p className="text-slate-600 mt-0.5">{candidate.whyThisPerson.experienceMatch}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900">Time Commitment</p>
                    <p className="text-slate-600 mt-0.5">{candidate.whyThisPerson.availabilityMatch}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Technical Skills & Tools</h3>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills?.map((skill) => (
                  <Badge key={skill} variant="default" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Areas of Interest & Tracks</h3>
              <div className="flex flex-wrap gap-1.5">
                {candidate.interests?.map((interest) => (
                  <Badge key={interest} variant="primary" size="md">
                    {interest}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Col: Coding Profiles & Contact info */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Verified Coding Profiles</h3>
              <div className="space-y-2.5 text-xs">
                {candidate.codingProfiles?.github && (
                  <a
                    href={candidate.codingProfiles.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Github size={16} />
                      <span className="font-medium">GitHub</span>
                    </div>
                    <span className="text-[11px] text-[#4F46E5]">View Profile</span>
                  </a>
                )}
                {candidate.codingProfiles?.leetcode && (
                  <a
                    href={candidate.codingProfiles.leetcode}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code size={16} />
                      <span className="font-medium">LeetCode</span>
                    </div>
                    <span className="text-[11px] text-[#4F46E5]">View Profile</span>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {candidate.projects?.map((proj) => (
            <Card key={proj.id} className="p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-[#172033] mb-1.5">{proj.title}</h4>
                <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {proj.techStack?.map((t) => (
                    <Badge key={t} variant="default" size="sm">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-3 text-xs">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    <Github size={14} />
                    <span>Source Repository</span>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Reputation Breakdown */}
      {activeTab === 'reputation' && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172033]">Hackathon Reputation Index</h3>
              <p className="text-xs text-[#64748B]">Score calculated from delivered code, jury ratings, and placements.</p>
            </div>
            <span className="text-2xl font-extrabold text-[#4F46E5]">{candidate.reputation} pts</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            Candidate has participated in 4 collegiate hackathons, delivered 100% of claimed deliverables on GitHub, and holds an average peer reliability score of 98%.
          </div>
        </Card>
      )}

      {/* Invitation Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title={`Invite ${candidate.name} to Team Nova`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Personalized Invitation Message
            </label>
            <textarea
              rows={3}
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                await sendInvitation(candidate.id, inviteNote);
                setIsInviteOpen(false);
              }}
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
