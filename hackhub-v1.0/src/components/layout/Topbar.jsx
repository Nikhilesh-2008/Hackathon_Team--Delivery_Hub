import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Award,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';

export const Topbar = ({ onMenuClick }) => {
  const { user, activeRole, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [apiOnline, setApiOnline] = useState(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkApiHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.success) {
          if (mounted) setApiOnline(true);
        } else {
          if (mounted) setApiOnline(false);
        }
      } catch (err) {
        if (mounted) setApiOnline(false);
      }
    };
    const loadNotifications = async () => {
      if (!user) return;
      try {
        const response = await api.get('/notifications');
        if (mounted) setNotifications((response.data?.notifications || []).map((item) => ({
          ...item,
          id: item._id || item.id,
          read: item.isRead,
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        })));
      } catch (error) {
        if (mounted) setNotifications([]);
      }
    };
    checkApiHealth();
    loadNotifications();
    return () => { mounted = false; };
  }, [user?.id]);

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.read);
    try {
      await Promise.all(unread.map((item) => api.patch(`/notifications/${item.id}/read`, {})));
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.warn('[Topbar] Could not mark notifications as read:', error.message);
    }
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium">
              {user?.name || 'Account'} · {activeRole}
            </span>

            {/* Live API Health Indicator */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              apiOnline === true
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : apiOnline === false
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                apiOnline === true ? 'bg-emerald-500' : apiOnline === false ? 'bg-red-500' : 'bg-slate-400'
              }`}></span>
              API: {apiOnline === true ? 'Online' : apiOnline === false ? 'Offline' : 'Checking...'}
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
            <span>{user?.reputation ?? 0}</span>
            <span className="text-[10px] text-indigo-400 font-normal hidden sm:inline">pts</span>
          </NavLink>

          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50" aria-label="Sign out">
            <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
          </button>

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
              {notifications.length === 0 && <p className="p-4 text-center text-xs text-slate-500">No notifications yet.</p>}
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
