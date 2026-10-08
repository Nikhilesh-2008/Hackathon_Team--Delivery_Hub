import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockNotifications } from '../data/reputation';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const NotificationsPage = () => {
  const [list, setList] = useState(mockNotifications);
  const { showSuccess } = useToast();

  const handleMarkAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, read: true })));
    showSuccess("All notifications marked as read");
  };

  const handleClear = () => {
    setList([]);
    showSuccess("Notifications cleared");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Activity Center"
        subtitle="Stay updated on team invitations, mentor reviews, and deadline reminders."
      >
        <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
          Mark All Read
        </Button>
        <Button variant="tertiary" size="sm" onClick={handleClear} className="text-red-600 hover:bg-red-50">
          Clear All
        </Button>
      </PageHeader>

      <Card className="p-6">
        {list.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Bell size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">No new notifications</p>
            <p className="text-xs text-slate-400">You're all caught up with your hackathon updates.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((n) => (
              <div key={n.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-indigo-600 ring-2 ring-indigo-100'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#172033]">{n.title}</h4>
                      <span className="text-[11px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                </div>

                {n.link && (
                  <NavLink to={n.link} className="self-end sm:self-center shrink-0">
                    <Button size="sm" variant="secondary" className="text-xs gap-1">
                      <span>View</span>
                      <ArrowRight size={13} />
                    </Button>
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
