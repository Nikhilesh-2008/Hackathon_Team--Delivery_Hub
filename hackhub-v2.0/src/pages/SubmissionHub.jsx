import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useTeam } from '../context/TeamContext';
import {
  Send,
  Code2 as Github,
  Globe,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

export const SubmissionHub = () => {
  const { submission, updateSubmission, submitProject } = useTeam();

  const [formData, setFormData] = useState({
    githubUrl: submission?.githubUrl || "https://github.com/karthik-dev/ai-study-planner",
    liveUrl: submission?.liveUrl || "https://study-planner-demo.vercel.app",
    demoVideoUrl: submission?.demoVideoUrl || "https://youtube.com/watch?v=demo-karthik",
    presentationUrl: submission?.presentationUrl || "https://docs.google.com/presentation/d/mock-slides",
    description: submission?.description || "Intelligent adaptive syllabus roadmap and automated quiz diagnostic platform.",
    checklist: submission?.checklist || {
      githubRepo: true,
      deploymentLink: true,
      projectDescription: true,
      presentationDeck: true,
      demoVideo: true,
      finalTesting: true
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const checklistItems = [
    { key: 'githubRepo', label: 'Public GitHub Repository with README' },
    { key: 'deploymentLink', label: 'Working Deployed Application URL' },
    { key: 'projectDescription', label: 'Problem statement & tech stack details' },
    { key: 'presentationDeck', label: 'Slide Deck / PPT Link' },
    { key: 'demoVideo', label: '2-Minute Video Walkthrough' },
    { key: 'finalTesting', label: 'Cross-device responsiveness verified' }
  ];

  const completedChecklistCount = Object.values(formData.checklist).filter(Boolean).length;
  const checklistPercent = Math.round((completedChecklistCount / checklistItems.length) * 100);

  const handleToggleChecklist = (key) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key]
      }
    }));
  };

  const handleSaveDraft = async () => {
    await updateSubmission(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitProject(formData);
    setIsSubmitting(false);

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Submission Hub"
        subtitle="Finalize your team's hackathon deliverables before the jury deadline."
        badge={
          <Badge variant={submission?.status === 'SUBMITTED' ? 'success' : 'warning'} size="md">
            {submission?.status === 'SUBMITTED' ? 'Submitted to Jury' : 'Draft in Progress'}
          </Badge>
        }
      />

      {/* Submission Success Banner */}
      {submission?.status === 'SUBMITTED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              🎉 Submission Successfully Received!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
              Your project has been delivered to the NexusHack 2026 jury panel. Evaluators will review your GitHub repository, live app, and demo video.
            </p>
          </div>
        </div>
      )}

      {/* Checklist & Readiness Progress */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Submission Checklist & Rules Compliance</h3>
            <p className="text-xs text-[#64748B]">All 6 items are required by the official hackathon rulebook.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-[#64748B]">Checklist Status</span>
            <p className="text-xl font-bold text-[#172033]">{completedChecklistCount} / {checklistItems.length} Complete</p>
          </div>
        </div>

        <div className="py-4">
          <ProgressBar value={checklistPercent} showLabel size="md" color={checklistPercent === 100 ? "success" : "primary"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {checklistItems.map((item) => (
            <label
              key={item.key}
              onClick={() => handleToggleChecklist(item.key)}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={formData.checklist[item.key] || false}
                onChange={() => {}}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-[#172033]">{item.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Submission Deliverables Form */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-[#172033] mb-4 pb-3 border-b border-[#E2E8F0]">
          Deliverable URLs & Documentation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="GitHub Repository URL (Mandatory)"
            icon={Github}
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            placeholder="https://github.com/your-team/project"
            required
          />

          <Input
            label="Live Deployment Link (Mandatory)"
            icon={Globe}
            value={formData.liveUrl}
            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
            placeholder="https://your-demo.vercel.app"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="2-Minute Demo Video Walkthrough"
              icon={Video}
              value={formData.demoVideoUrl}
              onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            <Input
              label="Slide Deck / Presentation Link"
              icon={FileText}
              value={formData.presentationUrl}
              onChange={(e) => setFormData({ ...formData, presentationUrl: e.target.value })}
              placeholder="https://docs.google.com/presentation/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Project Description & Pitch
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3.5 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
              placeholder="Summarize the core problem solved, architecture choices, and results..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="gap-2"
            >
              <Send size={15} />
              <span>{submission?.status === 'SUBMITTED' ? 'Update Final Submission' : 'Submit Project to Jury'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
