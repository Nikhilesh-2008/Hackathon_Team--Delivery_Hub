import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useToast } from '../context/ToastContext';
import { mockAiService } from '../services/mockAiService';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';

export const AiPlanner = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planStatus, setPlanStatus] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED'
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      const res = await mockAiService.getDeliveryPlan();
      setPlan(res);
      setLoading(false);
    };
    fetchPlan();
  }, []);

  const handleApprove = () => {
    setPlanStatus('APPROVED');
    showSuccess("AI Delivery Schedule approved! Team roadmap updated.");
  };

  const handleReject = () => {
    setPlanStatus('REJECTED');
    showInfo("AI Delivery proposal declined.");
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Generating AI sprint delivery analysis...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Sprint Delivery Planner"
        subtitle="Intelligent delivery forecast and milestone schedule optimizer based on team velocity."
        badge={<Badge variant="primary">Sprint Assistant</Badge>}
      />

      {/* Primary Query / Answer Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
          <Sparkles size={18} />
          <span>Core Question: "Can our team finish and submit before the Sunday deadline?"</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-base mb-1">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Yes, high probability of on-time delivery (88% confidence)</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
            {plan?.assessment}
          </p>
        </div>

        {/* Current Track Readiness Sub-Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Backend API</span>
            <p className="font-bold text-emerald-600 text-sm mt-0.5">✓ 90% Done</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Frontend UI</span>
            <p className="font-bold text-indigo-600 text-sm mt-0.5">80% Done</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Cloud Deploy</span>
            <p className="font-bold text-red-500 text-sm mt-0.5">⚠️ Blocked (Task #8)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Demo Video</span>
            <p className="font-bold text-amber-600 text-sm mt-0.5">⏳ Missing</p>
          </div>
        </div>
      </div>

      {/* Proposed AI Optimization Schedule */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Proposed Optimized Sprint Schedule</h3>
            <p className="text-xs text-[#64748B]">AI proposal for team execution over the next 36 hours</p>
          </div>
          {planStatus === 'APPROVED' && (
            <Badge variant="success" size="md">Plan Approved by Team</Badge>
          )}
          {planStatus === 'REJECTED' && (
            <Badge variant="danger" size="md">Plan Rejected</Badge>
          )}
        </div>

        <div className="space-y-3 py-4">
          {plan?.proposedSchedule?.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-32 shrink-0 font-bold text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                {slot.time}
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#172033] flex-1">
                {slot.task}
              </p>
            </div>
          ))}
        </div>

        {/* AI Recommendations List */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-6">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommendations</p>
          <ul className="text-xs text-slate-600 space-y-1.5">
            {plan?.recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Proposal Approve / Reject Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-slate-500 italic">
            *AI suggests improvements. Changes require captain approval before updating sprint boards.
          </p>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReject}
              disabled={planStatus !== 'PENDING'}
              className="gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <ThumbsDown size={14} />
              <span>Reject</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={planStatus !== 'PENDING'}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <ThumbsUp size={14} />
              <span>Approve Plan</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
