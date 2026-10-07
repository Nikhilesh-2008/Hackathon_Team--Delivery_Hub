import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { mockTeams, mockTasks } from '../data/teams';
import { mockFeedback } from '../data/reputation';
import {
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Send,
  Star
} from 'lucide-react';

export const MentorDashboard = () => {
  const [feedbackList, setFeedbackList] = useState(mockFeedback);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('4.5');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSuccess } = useToast();

  const handleOpenFeedback = (team) => {
    setSelectedTeam(team);
    setFeedbackTitle('');
    setFeedbackComment('');
    setIsModalOpen(true);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackComment.trim()) return;

    const newFb = {
      id: `fb_${Date.now()}`,
      teamId: selectedTeam.id,
      authorName: "Dr. Arvind Rao",
      authorRole: "Faculty Mentor · AI & Distributed Systems",
      timestamp: "Just now",
      rating: parseFloat(feedbackRating),
      title: feedbackTitle.trim(),
      comment: feedbackComment.trim(),
      recommendations: ["Review API response times", "Ensure code reproducibility"]
    };

    setFeedbackList([newFb, ...feedbackList]);
    setIsModalOpen(false);
    showSuccess("Feedback sent to team sprint board!");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockTeams.map((team) => (
            <Card key={team.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-base text-[#172033]">{team.name}</h4>
                  <Badge variant="primary" size="sm">{team.progress}% Done</Badge>
                </div>
                <p className="text-xs text-indigo-700 font-medium mb-1">{team.hackathonTitle}</p>
                <p className="text-xs text-[#64748B] mb-3">{team.challengeTitle}</p>

                <ProgressBar value={team.progress} size="sm" color="primary" className="mb-4" />

                {/* Team Blocker Indicator */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Active Blocker:</span>
                    <p className="text-[11px] text-amber-800">Render deployment SSL/CORS setup</p>
                  </div>
                </div>

                <div className="flex -space-x-1.5 overflow-hidden mb-2">
                  {team.members?.map((m) => (
                    <Avatar key={m.id} name={m.name} size="xs" className="ring-2 ring-white" />
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
      </div>

      {/* Published Feedback Log */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0]">
          Recent Mentorship Logs & Notes
        </h3>

        <div className="space-y-4">
          {feedbackList.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#172033]">{fb.title}</span>
                  <Badge variant="success" size="sm">{fb.rating} ★</Badge>
                </div>
                <span className="text-xs text-slate-400">{fb.timestamp}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{fb.comment}</p>
            </div>
          ))}
        </div>
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
            <Button type="submit" variant="primary" size="sm">
              Send Mentorship Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
