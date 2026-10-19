import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  MessageSquare,
  AlertTriangle,
  Send,
  Sparkles,
  Users
} from 'lucide-react';

export const MentorDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('4.5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, feedbackRes] = await Promise.allSettled([
        api.get('/mentor/teams'),
        api.get('/mentor/feedback'),
      ]);

      if (teamsRes.status === 'fulfilled' && teamsRes.value?.data) {
        setTeams(teamsRes.value.data);
      }
      if (feedbackRes.status === 'fulfilled' && feedbackRes.value?.data) {
        setFeedbackList(feedbackRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load mentor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenFeedback = (team) => {
    setSelectedTeam(team);
    setFeedbackTitle('');
    setFeedbackComment('');
    setFeedbackRating('4.5');
    setIsModalOpen(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackComment.trim() || !selectedTeam) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: feedbackTitle.trim(),
        message: feedbackComment.trim(),
        rating: parseFloat(feedbackRating),
        recommendations: ['Maintain unit tests', 'Document API contracts'],
      };

      const res = await api.post(`/teams/${selectedTeam.id || selectedTeam._id}/feedback`, payload);
      const created = res.data;

      setFeedbackList((prev) => [
        {
          id: created?._id || `fb_${Date.now()}`,
          title: created?.title || payload.title,
          comment: created?.message || payload.message,
          message: created?.message || payload.message,
          rating: created?.rating || payload.rating,
          timestamp: 'Just now',
          teamName: selectedTeam.name,
        },
        ...prev,
      ]);

      setIsModalOpen(false);
      showSuccess(`Mentorship feedback sent to ${selectedTeam.name}!`);
    } catch (err) {
      showError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor Evaluation & Guidance Hub"
        subtitle="Review assigned student teams, monitor blocker tasks, and provide architectural mentorship."
        badge={<Badge variant="primary">Faculty Mentor Mode</Badge>}
      />

      {/* Assigned Teams Section */}
      <div>
        <h3 className="text-base font-bold text-[#172033] mb-3">Assigned Hackathon Teams</h3>
        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading assigned teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Users className="mx-auto text-slate-400" size={32} />
            <p className="text-sm font-semibold text-slate-700">No Teams Assigned Yet</p>
            <p className="text-xs text-slate-500">Student teams participating in active hackathons will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teams.map((team) => (
              <Card key={team.id || team._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-base text-[#172033]">{team.name}</h4>
                    <Badge variant="primary" size="sm">{team.progress || 0}% Done</Badge>
                  </div>
                  <p className="text-xs text-indigo-700 font-medium mb-1">
                    {team.hackathonTitle || team.eventId?.name || 'NexusHack 2026'}
                  </p>
                  <p className="text-xs text-[#64748B] mb-3">
                    {team.challengeTitle || team.challengeId?.title || team.track || 'AI & Cloud Track'}
                  </p>

                  <ProgressBar value={team.progress || 0} size="sm" color="primary" className="mb-4" />

                  {/* Team Blocker Indicator */}
                  {team.blocker ? (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4 flex items-start gap-2">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Active Blocker:</span>
                        <p className="text-[11px] text-amber-800">{team.blocker}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 mb-4 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-600 shrink-0" />
                      <span>Sprint running on schedule</span>
                    </div>
                  )}

                  <div className="flex -space-x-1.5 overflow-hidden mb-2">
                    {(team.members || []).map((m) => (
                      <Avatar key={m.id || m.name} name={m.name} size="xs" className="ring-2 ring-white" />
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenFeedback(team)}
                    className="gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>Leave Feedback</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Published Feedback Log */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0]">
          Recent Mentorship Logs & Notes
        </h3>

        {feedbackList.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No mentorship logs posted yet. Select a team above to provide architectural feedback.</p>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((fb) => (
              <div key={fb.id || fb._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172033]">{fb.title}</span>
                    {fb.teamName && (
                      <Badge variant="default" size="sm">Team: {fb.teamName}</Badge>
                    )}
                    <Badge variant="success" size="sm">{fb.rating || 5} ★</Badge>
                  </div>
                  <span className="text-xs text-slate-400">{fb.timestamp}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {fb.comment || fb.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Provide Feedback for ${selectedTeam?.name || 'Team'}`}
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <Input
            label="Feedback Subject / Highlight"
            value={feedbackTitle}
            onChange={(e) => setFeedbackTitle(e.target.value)}
            placeholder="e.g. Cache vector queries to optimize live jury latency"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Rating</label>
            <select
              value={feedbackRating}
              onChange={(e) => setFeedbackRating(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="5.0">5.0 - Exceptional Implementation</option>
              <option value="4.5">4.5 - Strong with minor suggestions</option>
              <option value="4.0">4.0 - Good progress</option>
              <option value="3.5">3.5 - Needs architecture adjustments</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Detailed Feedback</label>
            <textarea
              rows={4}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Suggest improvements, warn about jury questions, or validate technical choices..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Mentorship Note'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
