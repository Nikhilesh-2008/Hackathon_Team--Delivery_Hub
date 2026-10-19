import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Code2 as Github,
  Globe,
  Video,
  FileText,
  Star,
  Award,
  CheckCircle2,
  BookOpen,
  Layers,
  Clock,
  LoaderCircle
} from 'lucide-react';

export const JudgeDashboard = () => {
  const { showSuccess, showError } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Evaluation Rubric scores
  const [scores, setScores] = useState({
    innovation: 22,
    technical: 28,
    ux: 18,
    impact: 23,
    remarks: ''
  });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/judge/submissions');
      setSubmissions(res.data || []);
    } catch (err) {
      console.warn('[JudgeDashboard] Failed to fetch submissions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const totalScore = scores.innovation + scores.technical + scores.ux + scores.impact;

  const handleOpenRubric = (sub) => {
    setSelectedSubmission(sub);
    setScores({
      innovation: 22,
      technical: 28,
      ux: 18,
      impact: 23,
      remarks: ''
    });
    setIsRubricOpen(true);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setSubmittingScore(true);
      const payload = {
        rubricVersion: selectedSubmission.rubricVersion || 1,
        criteriaScores: [
          { criterionName: 'Innovation & Novelty', maxPoints: 25, score: scores.innovation },
          { criterionName: 'Technical Architecture & Stability', maxPoints: 30, score: scores.technical },
          { criterionName: 'UI/UX Polish & Accessibility', maxPoints: 20, score: scores.ux },
          { criterionName: 'Practical Impact & Demo Pitch', maxPoints: 25, score: scores.impact },
        ],
        comments: scores.remarks,
      };

      const targetId = selectedSubmission._id || selectedSubmission.id;
      await api.post(`/submissions/${targetId}/scores`, payload);

      setIsRubricOpen(false);
      showSuccess(`Evaluation submitted for ${selectedSubmission.teamId?.name || selectedSubmission.teamName || 'Team'}! Score: ${totalScore}/100`);
      await fetchSubmissions();
    } catch (err) {
      showError(err.message || 'Failed to submit score to backend');
    } finally {
      setSubmittingScore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jury Evaluation & Scoring Console"
        subtitle="Review participant deliverables, inspect codebase repositories, test live apps, and score submissions."
        badge={<Badge variant="primary">Official Jury Mode</Badge>}
      >
        <NavLink to="/rulebook">
          <Button variant="secondary" size="sm" className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <BookOpen size={15} />
            <span>Read Rulebook & Rubrics</span>
          </Button>
        </NavLink>
      </PageHeader>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Assigned Submissions</p>
            <p className="text-xl font-bold text-[#172033]">{submissions.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Evaluated Projects</p>
            <p className="text-xl font-bold text-emerald-600">
              {submissions.filter(s => s.currentScore !== null && s.currentScore !== undefined).length}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Evaluation</p>
            <p className="text-xl font-bold text-amber-600">
              {submissions.filter(s => s.currentScore === null || s.currentScore === undefined).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base font-bold text-[#172033]">Participant Submissions for Jury Review</h2>
          <span className="text-xs text-slate-500 font-medium">{submissions.length} total projects</span>
        </div>

        {loading ? (
          <Card className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <LoaderCircle size={24} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading participant submissions for evaluation...</p>
          </Card>
        ) : submissions.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-base text-[#172033]">No Submissions Awaiting Evaluation</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Participant teams are currently working on their projects. As soon as teams finalize and submit their deliverables, they will appear here for jury scoring.
            </p>
            <NavLink to="/rulebook">
              <Button variant="secondary" size="sm" className="mt-2 gap-1.5">
                <BookOpen size={14} />
                <span>Review Official Judging Rubric</span>
              </Button>
            </NavLink>
          </Card>
        ) : (
          submissions.map((sub) => {
            const teamName = sub.teamId?.name || sub.teamName || 'Participant Team';
            const projectTitle = sub.challengeId?.title || sub.projectTitle || sub.description || 'Hackathon Solution';
            const track = sub.challengeId?.track || sub.track || 'General Innovation';
            const githubUrl = sub.repositoryUrl || sub.githubUrl;
            const liveUrl = sub.deploymentUrl || sub.liveUrl;
            const videoUrl = sub.demoVideoUrl || sub.videoUrl;
            const pptUrl = sub.presentationUrl || sub.pptUrl;
            const hasScore = sub.currentScore !== null && sub.currentScore !== undefined;

            return (
              <Card key={sub._id || sub.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary" size="sm">{track}</Badge>
                      <span className="text-xs text-slate-500 font-medium">
                        By <strong>{teamName}</strong>
                      </span>
                      {hasScore ? (
                        <Badge variant="success" size="sm">Evaluated</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Ready for Evaluation</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#172033] pt-1">{projectTitle}</h3>
                    {sub.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">{sub.description}</p>
                    )}

                    {/* Deliverables Row */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3 text-xs">
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <Github size={14} />
                          <span>Source Code</span>
                        </a>
                      )}
                      {liveUrl && (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors"
                        >
                          <Globe size={14} />
                          <span>Live App Demo</span>
                        </a>
                      )}
                      {videoUrl && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 font-medium transition-colors"
                        >
                          <Video size={14} />
                          <span>Demo Video</span>
                        </a>
                      )}
                      {pptUrl && (
                        <a
                          href={pptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <FileText size={14} />
                          <span>Presentation Deck</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {hasScore ? (
                      <div className="text-right bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                        <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">Score Awarded</span>
                        <p className="text-2xl font-black text-indigo-600">{sub.currentScore} <span className="text-xs font-normal text-slate-500">/ 100</span></p>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenRubric(sub)}
                        className="gap-1.5 shadow-xs"
                      >
                        <Star size={15} />
                        <span>Evaluate Submission</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Rubric Evaluation Modal */}
      <Modal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
        title={`Jury Rubric: ${selectedSubmission?.teamId?.name || selectedSubmission?.teamName || 'Team'}`}
        description="Score deliverables objectively based on official 100-point hackathon criteria"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Innovation &amp; Novelty (Max 25 pts)</span>
              <span className="text-indigo-600 font-bold">{scores.innovation} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={scores.innovation}
              onChange={(e) => setScores({ ...scores, innovation: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Technical Architecture &amp; Stability (Max 30 pts)</span>
              <span className="text-indigo-600 font-bold">{scores.technical} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={scores.technical}
              onChange={(e) => setScores({ ...scores, technical: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>UI/UX Polish &amp; Accessibility (Max 20 pts)</span>
              <span className="text-indigo-600 font-bold">{scores.ux} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={scores.ux}
              onChange={(e) => setScores({ ...scores, ux: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Practical Impact &amp; Demo Pitch (Max 25 pts)</span>
              <span className="text-indigo-600 font-bold">{scores.impact} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={scores.impact}
              onChange={(e) => setScores({ ...scores, impact: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">Jury Remarks &amp; Feedback</label>
            <textarea
              rows={2}
              value={scores.remarks}
              onChange={(e) => setScores({ ...scores, remarks: e.target.value })}
              placeholder="Constructive feedback on code quality, user experience, and architecture..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl flex items-center justify-between text-sm font-bold text-indigo-950">
            <span>Total Rubric Score</span>
            <span className="text-lg text-indigo-700">{totalScore} / 100</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsRubricOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submittingScore} className="gap-1.5">
              {submittingScore && <LoaderCircle size={14} className="animate-spin" />}
              <span>{submittingScore ? 'Submitting...' : 'Submit Official Score'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default JudgeDashboard;
