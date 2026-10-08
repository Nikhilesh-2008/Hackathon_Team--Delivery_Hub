import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Code2 as Github,
  Globe,
  Video,
  FileText,
  Star,
  Award,
  CheckCircle2
} from 'lucide-react';

export const JudgeDashboard = () => {
  const { showSuccess } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  // Evaluation Rubric scores
  const [scores, setScores] = useState({
    innovation: 22,
    technical: 28,
    ux: 18,
    impact: 23,
    remarks: ''
  });

  const submissions = [
    {
      id: "sub_1",
      teamName: "Team Nova",
      projectTitle: "AI Adaptive Study Engine",
      track: "AI & Education",
      githubUrl: "https://github.com/karthik-dev/ai-study-planner",
      liveUrl: "https://study-planner-demo.vercel.app",
      videoUrl: "https://youtube.com/watch?v=demo",
      pptUrl: "https://docs.google.com/presentation/d/demo",
      status: "PENDING_EVALUATION",
      currentScore: null
    },
    {
      id: "sub_2",
      teamName: "ByteCraft",
      projectTitle: "Lightweight API Mocking Studio",
      track: "Developer Tools",
      githubUrl: "https://github.com/tanmay-fullstack/collabboard",
      liveUrl: "https://bytecraft-mock.dev",
      videoUrl: "https://youtube.com/watch?v=demo2",
      pptUrl: "https://docs.google.com/presentation/d/demo2",
      status: "EVALUATED",
      currentScore: 84
    }
  ];

  const totalScore = scores.innovation + scores.technical + scores.ux + scores.impact;

  const handleOpenRubric = (sub) => {
    setSelectedSubmission(sub);
    setIsRubricOpen(true);
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    setIsRubricOpen(false);
    showSuccess(`Evaluation submitted for ${selectedSubmission.teamName}! Total: ${totalScore}/100`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jury Evaluation & Scoring Console"
        subtitle="Review deliverable repositories, inspect live deployments, and assign rubric scores."
        badge={<Badge variant="primary">Industry Judge Mode</Badge>}
      />

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary" size="sm">{sub.track}</Badge>
                  <span className="text-xs text-slate-500 font-medium">By <strong>{sub.teamName}</strong></span>
                </div>
                <h3 className="text-lg font-bold text-[#172033]">{sub.projectTitle}</h3>

                {/* Deliverables Row */}
                <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
                  <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
                    <Github size={14} />
                    <span>Source Code</span>
                  </a>
                  <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <Globe size={14} />
                    <span>Live App Demo</span>
                  </a>
                  <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                    <Video size={14} />
                    <span>Demo Video</span>
                  </a>
                  <a href={sub.pptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
                    <FileText size={14} />
                    <span>Slides</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {sub.currentScore ? (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Score Given</span>
                    <p className="text-xl font-black text-indigo-600">{sub.currentScore} / 100</p>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenRubric(sub)}
                    className="gap-1.5"
                  >
                    <Star size={15} />
                    <span>Evaluate Submission</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rubric Evaluation Modal */}
      <Modal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
        title={`Judge Rubric: ${selectedSubmission?.teamName || 'Team'}`}
        description="Score based on official 100-point hackathon criteria"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Innovation & Novelty (Max 25 pts)</span>
              <span className="text-indigo-600">{scores.innovation} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={scores.innovation}
              onChange={(e) => setScores({ ...scores, innovation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Technical Architecture & Stability (Max 30 pts)</span>
              <span className="text-indigo-600">{scores.technical} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={scores.technical}
              onChange={(e) => setScores({ ...scores, technical: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>UI/UX Polish & Accessibility (Max 20 pts)</span>
              <span className="text-indigo-600">{scores.ux} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.ux}
              onChange={(e) => setScores({ ...scores, ux: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Practical Impact & Demo Pitch (Max 25 pts)</span>
              <span className="text-indigo-600">{scores.impact} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={scores.impact}
              onChange={(e) => setScores({ ...scores, impact: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl flex items-center justify-between text-sm font-bold text-indigo-950">
            <span>Total Score</span>
            <span className="text-lg">{totalScore} / 100</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRubricOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Official Score
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
