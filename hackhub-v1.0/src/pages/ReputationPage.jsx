import React, { useEffect, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ReputationPage = () => {
  const { user } = useAuth();
  const [reputation, setReputation] = useState({ totalPoints: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/reputation/me')
      .then((response) => { if (mounted) setReputation(response.data || { totalPoints: 0, history: [] }); })
      .catch((requestError) => { if (mounted) setError(requestError.message || 'Unable to load reputation history.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Hackathon Reputation Score" subtitle="Your points and activity are calculated from the HackHub reputation ledger." />

      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:p-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase text-indigo-600">{user?.name || 'Your account'}</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">{reputation.totalPoints || 0} <span className="text-lg font-normal text-slate-500">Reputation Points</span></h2>
          <p className="max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">Each entry below reflects a persisted reputation change recorded for your account.</p>
        </div>
        <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50/80 text-indigo-700">
          <Award size={40} className="mb-1 text-indigo-600" />
          <span className="text-xs font-bold">Current score</span>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3"><TrendingUp size={17} className="text-indigo-600" /><h3 className="text-base font-bold text-slate-900">Reputation history</h3></div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading reputation…</p> : reputation.history?.length ? (
          <div className="space-y-3">
            {reputation.history.map((entry) => (
              <div key={entry._id || entry.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-bold text-slate-900">{entry.eventId?.name || 'HackHub activity'}</h4><Badge variant="primary" size="sm">{entry.type}</Badge></div><p className="mt-1 text-xs text-slate-600">{entry.reason}</p></div>
                <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end"><span className={`text-base font-bold ${entry.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{entry.points > 0 ? '+' : ''}{entry.points} pts</span><span className="text-[11px] text-slate-400">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ''}</span></div>
              </div>
            ))}
          </div>
        ) : <p className="py-8 text-center text-sm text-slate-500">No reputation activity has been recorded yet.</p>}
      </Card>
    </div>
  );
};
