import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { CandidateCard } from '../components/team/CandidateCard';
import { useTeam } from '../context/TeamContext';
import { mockProfileService } from '../services/mockProfileService';
import {
  Sparkles,
  Users,
  Filter,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

export const TeamFinder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'All';
  
  const [candidates, setCandidates] = useState([]);
  const [specialization, setSpecialization] = useState('All');
  const [skill, setSkill] = useState(initialSkill);
  const [searchQuery, setSearchQuery] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Invitation Modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { sendInvitation } = useTeam();

  const specializations = [
    'All',
    'Frontend Developer',
    'Backend Developer',
    'AI/ML Developer',
    'UI/UX Designer',
    'DevOps Developer',
    'Database Developer'
  ];

  const popularSkills = [
    'All',
    'React',
    'Node.js',
    'Python',
    'LangChain',
    'Figma',
    'TypeScript',
    'Tailwind CSS',
    'MongoDB',
    'Docker'
  ];

  const fetchCandidates = async () => {
    setLoading(true);
    const data = await mockProfileService.getCandidates({
      specialization,
      skill,
      searchQuery: nlQuery || searchQuery
    });
    setCandidates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [specialization, skill, searchQuery, nlQuery]);

  const handleOpenInvite = (candidate) => {
    setSelectedCandidate(candidate);
    setInviteMessage(`Hey ${candidate.name}, we'd love to invite you to Team Nova for the NexusHack AI Challenge!`);
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedCandidate) return;
    await sendInvitation(selectedCandidate.id, inviteMessage);
    setIsInviteModalOpen(false);
  };

  const handleApplyPresetNL = (promptText) => {
    setNlQuery(promptText);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Your Hackathon Teammates"
        subtitle="Tell us who you need for your squad. We'll match compatibility, skills, availability, and reputation."
      />

      {/* Natural Language Prompt Search Box */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
          <Bot size={16} />
          <span>Smart Natural Language Matcher</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="e.g. I need a frontend developer who knows React & Figma, likes AI, and is available 8 hours/week"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <Button
            variant="primary"
            size="md"
            onClick={fetchCandidates}
            className="shrink-0"
          >
            <Sparkles size={16} />
            <span>Find Teammates</span>
          </Button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Try asking:</span>
          <button
            onClick={() => handleApplyPresetNL("Frontend dev with React and Tailwind experience")}
            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 px-2 py-0.5 rounded-lg transition-colors"
          >
            "Frontend dev with React & Tailwind"
          </button>
          <button
            onClick={() => handleApplyPresetNL("AI developer who knows LangChain and Python")}
            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 px-2 py-0.5 rounded-lg transition-colors"
          >
            "AI dev for LangChain pipeline"
          </button>
          <button
            onClick={() => handleApplyPresetNL("UI UX designer for rapid Figma prototyping")}
            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 px-2 py-0.5 rounded-lg transition-colors"
          >
            "UI/UX designer with Figma"
          </button>
          {nlQuery && (
            <button
              onClick={() => setNlQuery('')}
              className="text-slate-400 hover:text-slate-600 text-[11px] underline ml-auto"
            >
              Reset Prompt
            </button>
          )}
        </div>
      </div>

      {/* Specific Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Specialization Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Role:</span>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialization(spec)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                specialization === spec
                  ? 'bg-[#4F46E5] text-white font-semibold'
                  : 'bg-slate-100 text-[#172033] hover:bg-slate-200/80'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#64748B]">
            Showing <strong className="text-[#172033]">{candidates.length}</strong> compatible candidates
          </p>
          <span className="text-xs text-indigo-600 font-medium">Sorted by Compatibility %</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-slate-200/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                onInvite={handleOpenInvite}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No Matching Candidates Found"
            description="No candidates matched your exact filter parameters. Try clearing some tags or simplifying your prompt."
            actionText="Reset All Filters"
            onAction={() => {
              setSpecialization('All');
              setSkill('All');
              setSearchQuery('');
              setNlQuery('');
            }}
          />
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Invite ${selectedCandidate?.name || 'Peer'} to Team Nova`}
        description="Collaborate together on NexusHack 2026 AI track."
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p className="font-semibold text-slate-700">Team Target Challenge:</p>
            <p className="text-slate-600">NexusHack 2026 · Intelligent Adaptive Study Engine</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Personalized Invitation Note
            </label>
            <textarea
              rows={3}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendInvite} className="gap-1.5">
              <Send size={14} />
              <span>Send Invitation</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
