import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  UserPlus,
  Users,
  CheckSquare,
  Send,
  BookOpen,
  Sparkles,
  Award,
  Settings,
  X,
  Layers,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, activeRole } = useAuth();

  const getNavLinks = () => {
    // Role-specific primary navigation items
    if (activeRole === 'Mentor') {
      return [
        { to: '/dashboard', label: 'Mentor Hub', icon: LayoutDashboard },
        { to: '/team/feedback', label: 'Team Reviews', icon: GraduationCap },
        { to: '/events', label: 'Hackathons', icon: Compass },
        { to: '/rulebook', label: 'Rulebook & Rubrics', icon: BookOpen },
      ];
    }
    if (activeRole === 'Judge') {
      return [
        { to: '/dashboard', label: 'Judge Hub', icon: LayoutDashboard },
        { to: '/team/submission', label: 'Submissions & Rubrics', icon: ShieldCheck },
        { to: '/events', label: 'Hackathons', icon: Compass },
        { to: '/rulebook', label: 'Evaluation Rules', icon: BookOpen },
      ];
    }
    if (activeRole === 'Organizer') {
      return [
        { to: '/dashboard', label: 'Organizer Console', icon: LayoutDashboard },
        { to: '/events', label: 'Manage Hackathons', icon: Compass },
        { to: '/team-finder', label: 'Participants', icon: UserPlus },
        { to: '/rulebook', label: 'Rulebook Editor', icon: BookOpen },
      ];
    }

    // Default Participant Navigation
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/events', label: 'Discover Hackathons', icon: Compass },
      { to: '/team-finder', label: 'Team Finder', icon: UserPlus },
      { to: '/team', label: 'My Team', icon: Users },
      { to: '/team/tasks', label: 'Tasks & Timeline', icon: CheckSquare },
      { to: '/team/submission', label: 'Submission', icon: Send },
      { to: '/rulebook', label: 'Rulebook AI', icon: BookOpen },
      { to: '/ai-planner', label: 'AI Delivery Planner', icon: Sparkles, badge: 'AI' },
      { to: '/reputation', label: 'Reputation', icon: Award },
    ];
  };

  const navLinks = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0]">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-[#4338CA] transition-colors">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-[#172033] tracking-tight">HackHub</span>
              <span className="text-[10px] uppercase font-bold bg-indigo-50 text-[#4F46E5] px-1.5 py-0.5 rounded-md">v1.0</span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium leading-none">Team & Delivery</p>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {activeRole} Workspace
        </p>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/team'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-indigo-50 text-[#4F46E5] font-semibold"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50"
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={18} className="shrink-0 transition-colors group-hover:text-[#172033]" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant="primary" size="sm">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </p>
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-[#4F46E5] font-semibold"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50"
              )
            }
          >
            <Avatar name={user?.name || "Karthik"} size="xs" />
            <span>My Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-[#4F46E5] font-semibold"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50"
              )
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all border border-transparent hover:border-[#E2E8F0]"
        >
          <Avatar name={user?.name || "Karthik"} size="sm" status="online" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#172033] truncate">
              {user?.name || "Karthik"}
            </p>
            <p className="text-[11px] text-[#64748B] truncate">
              {user?.specialization || "Backend Developer"}
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
