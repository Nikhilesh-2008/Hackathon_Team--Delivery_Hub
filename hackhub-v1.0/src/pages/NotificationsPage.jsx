import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';

const presentNotification = (item) => ({
  ...item,
  id: item._id || item.id,
  read: item.isRead,
  time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
});

export const NotificationsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.get('/notifications');
      setList((response.data?.notifications || []).map(presentNotification));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`, {});
      setList((current) => current.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this notification.');
    }
  };

  const markAllRead = async () => {
  try {
    await api.patch('/notifications/read-all', {});
    setList((current) => current.map((item) => ({ ...item, read: true })));
  } catch (requestError) {
    setError(requestError.message || 'Unable to mark all notifications as read.');
  }
};
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications & Activity Center" subtitle="Stay updated on team invitations, mentor reviews, and deadline reminders.">
        <Button variant="secondary" size="sm" onClick={markAllRead} disabled={!list.some((item) => !item.read)}>Mark All Read</Button>
      </PageHeader>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <Card className="p-6">
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading notifications…</p> : list.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Bell size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No notifications yet</p>
            <p className="text-xs text-slate-400">New team and event activity will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((item) => (
              <div key={item.id} className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? 'bg-slate-300' : 'bg-indigo-600 ring-2 ring-indigo-100'}`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-bold text-slate-900">{item.title}</h4><span className="text-[11px] text-slate-400">{item.time}</span></div>
                    <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">{item.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!item.read && <Button size="sm" variant="tertiary" onClick={() => markRead(item.id)}>Mark read</Button>}
                  {item.link && <NavLink to={item.link}><Button size="sm" variant="secondary" className="gap-1 text-xs">View <ArrowRight size={13} /></Button></NavLink>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
