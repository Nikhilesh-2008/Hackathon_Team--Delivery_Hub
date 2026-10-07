import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  Award,
  ChevronDown,
  UserCheck,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { mockNotifications } from '../../data/reputation';

export const Topbar = ({ onMenuClick }) => {
  const { user, activeRole, switchRole, demoRoles } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Mobile Menu Toggle & Breadcrumb/Role info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Mode:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Demo Mode ({activeRole})
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Reputation Highlight Pill */}
          <NavLink
            to="/reputation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 text-[#4F46E5] text-xs font-semibold transition-colors"
            title="Hackathon Reputation Score"
          >
            <Award size={15} />
            <span>{user?.reputation || 1250}</span>
            <span className="text-[10px] text-indigo-400 font-normal hidden sm:inline">pts</span>
          </NavLink>

          {/* Demo Role Switcher Dropdown */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-[#172033] border border-slate-200 transition-colors cursor-pointer">
                <UserCheck size={14} className="text-[#4F46E5]" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-semibold">{activeRole}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
            }
          >
            <div className="px-3 py-2 border-b border-[#E2E8F0] bg-slate-50 rounded-t-xl">
              <p className="text-xs font-bold text-[#172033]">Switch Demo Persona</p>
              <p className="text-[10px] text-[#64748B]">Test role-specific workflows</p>
            </div>
            {demoRoles.map((roleObj) => (
              <DropdownItem
                key={roleObj.id}
                onClick={() => switchRole(roleObj.role)}
                className="justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-[#172033]">{roleObj.name}</span>
                  <span className="text-[10px] text-[#64748B]">{roleObj.badge}</span>
                </div>
                {activeRole === roleObj.role && (
                  <Check size={14} className="text-[#4F46E5]" />
                )}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* Notification Center Dropdown */}
          <Dropdown
            trigger={
              <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>
            }
          >
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#172033]">Notifications</p>
                {unreadCount > 0 && (
                  <Badge variant="primary" size="sm">{unreadCount} new</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#4F46E5] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    navigate(n.link || '/dashboard');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-semibold text-[#172033]">{n.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#E2E8F0] text-center bg-slate-50 rounded-b-xl">
              <NavLink to="/notifications" className="text-xs font-medium text-[#4F46E5] hover:underline">
                View All Activity
              </NavLink>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
