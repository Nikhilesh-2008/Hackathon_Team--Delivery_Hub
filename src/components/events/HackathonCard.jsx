import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Trophy, Users, ArrowRight } from 'lucide-react';

export const HackathonCard = ({ hackathon, onSelect }) => {
  return (
    <Card hover className="flex flex-col justify-between h-full group">
      <div>
        {/* Card Header & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge
            variant={hackathon.status === 'Active' ? 'success' : 'primary'}
            size="sm"
          >
            {hackathon.status}
          </Badge>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            {hackathon.prizePool}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#172033] group-hover:text-[#4F46E5] transition-colors leading-tight mb-1">
          {hackathon.title}
        </h3>
        <p className="text-xs font-medium text-[#64748B] mb-3">
          Organized by {hackathon.organizer}
        </p>

        <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
          {hackathon.description}
        </p>

        {/* Metadata info rows */}
        <div className="space-y-1.5 text-xs text-[#64748B] mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>{hackathon.startDate} - {hackathon.endDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{hackathon.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400 shrink-0" />
            <span>Team: {hackathon.teamSize}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hackathon.tags?.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Card Footer Button */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          {hackathon.challengeCount} Challenges
        </span>
        <NavLink to={`/events/${hackathon.id}`}>
          <Button size="sm" variant="secondary" className="group-hover:border-[#4F46E5] group-hover:text-[#4F46E5]">
            <span>View Details</span>
            <ArrowRight size={14} />
          </Button>
        </NavLink>
      </div>
    </Card>
  );
};
