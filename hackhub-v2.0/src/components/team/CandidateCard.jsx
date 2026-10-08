import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Award, Clock, Check, Sparkles, Send } from 'lucide-react';

export const CandidateCard = ({ candidate, onInvite }) => {
  return (
    <Card hover className="flex flex-col justify-between h-full bg-white">
      <div>
        {/* Candidate Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={candidate.name} size="md" />
            <div>
              <NavLink to={`/profile/${candidate.id}`}>
                <h4 className="font-bold text-sm sm:text-base text-[#172033] hover:text-[#4F46E5] transition-colors leading-tight">
                  {candidate.name}
                </h4>
              </NavLink>
              <p className="text-xs font-medium text-[#64748B]">
                {candidate.specialization}
              </p>
            </div>
          </div>

          {candidate.matchScore && (
            <div className="flex items-center gap-1 bg-indigo-50 text-[#4F46E5] border border-indigo-200 px-2 py-1 rounded-lg text-xs font-bold">
              <Sparkles size={13} />
              <span>{candidate.matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Reputation & Availability Stats */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Award size={14} className="text-indigo-600 shrink-0" />
            <span className="text-slate-500">Rep:</span>
            <span className="font-semibold text-[#172033]">{candidate.reputation}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock size={14} className="text-slate-400 shrink-0" />
            <span className="text-slate-500">Avail:</span>
            <span className="font-semibold text-[#172033] truncate">{candidate.availability}</span>
          </div>
        </div>

        {/* Skills Tag Row */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills</p>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="default" size="sm">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 5 && (
              <Badge variant="outline" size="sm">
                +{candidate.skills.length - 5}
              </Badge>
            )}
          </div>
        </div>

        {/* Why this person? Reasoning Box */}
        {candidate.whyThisPerson && (
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 mb-4">
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
              <Check size={14} className="text-emerald-600" />
              Why this person?
            </p>
            <ul className="text-[11px] text-emerald-800/90 space-y-1">
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{candidate.whyThisPerson.skillsMatch}</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{candidate.whyThisPerson.interestMatch}</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{candidate.whyThisPerson.availabilityMatch}</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-2">
        <NavLink to={`/profile/${candidate.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            View Profile
          </Button>
        </NavLink>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onInvite && onInvite(candidate)}
          className="gap-1.5"
        >
          <Send size={13} />
          <span>Invite</span>
        </Button>
      </div>
    </Card>
  );
};
