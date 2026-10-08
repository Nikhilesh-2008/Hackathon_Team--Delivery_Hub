import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Award,
  Code2 as Github,
  Code,
  Globe,
  GraduationCap,
  Clock,
  Edit,
  Plus,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit state
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    specialization: user?.specialization || '',
    availability: user?.availability || '',
    college: user?.college || '',
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUser(editForm);
    setIsEditModalOpen(false);
    showSuccess("Profile updated successfully!");
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Skills' },
    { id: 'projects', label: `Projects (${user?.projects?.length || 0})` },
    { id: 'history', label: `Hackathons (${user?.hackathonHistory?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Developer Profile"
        subtitle="Manage your public hackathon identity, skills, and coding credentials."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setEditForm({
              name: user?.name || '',
              bio: user?.bio || '',
              specialization: user?.specialization || '',
              availability: user?.availability || '',
              college: user?.college || '',
            });
            setIsEditModalOpen(true);
          }}
          className="gap-1.5"
        >
          <Edit size={14} />
          <span>Edit Profile</span>
        </Button>
      </PageHeader>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={user?.name || "Karthik"} size="xl" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#172033]">{user?.name}</h1>
              <Badge variant="primary">{user?.specialization}</Badge>
              <Badge variant="success">Available for Hackathons</Badge>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-2">
              <GraduationCap size={15} className="text-slate-400" />
              <span>{user?.college} · {user?.year}</span>
            </p>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed pt-1">
              {user?.bio}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
                <Award size={14} />
                <span>Reputation: <strong>{user?.reputation} pts</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                <Clock size={14} />
                <span>Commitment: <strong>{user?.availability}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {user?.skills?.map((s) => (
                  <Badge key={s} variant="default" size="md">{s}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Preferred Tracks & Interests</h3>
              <div className="flex flex-wrap gap-1.5">
                {user?.interests?.map((i) => (
                  <Badge key={i} variant="primary" size="md">{i}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Certifications</h3>
              <div className="space-y-2.5">
                {user?.certificates?.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#172033]">{c.title}</p>
                      <p className="text-slate-500">{c.issuer}</p>
                    </div>
                    <span className="text-slate-400">{c.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#172033] mb-3">Coding Profiles</h3>
              <div className="space-y-2.5 text-xs">
                {user?.codingProfiles?.github && (
                  <a href={user.codingProfiles.github} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Github size={16} />
                      <span className="font-medium">GitHub</span>
                    </div>
                    <span className="text-[11px] text-indigo-600">karthik-dev</span>
                  </a>
                )}
                {user?.codingProfiles?.leetcode && (
                  <a href={user.codingProfiles.leetcode} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Code size={16} />
                      <span className="font-medium">LeetCode</span>
                    </div>
                    <span className="text-[11px] text-indigo-600">karthik_code</span>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {user?.projects?.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-[#172033] mb-1">{p.title}</h4>
                <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {p.techStack?.map((t) => (
                    <Badge key={t} variant="default" size="sm">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-4 text-xs">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    <Github size={14} />
                    <span>Repository</span>
                  </a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                    <Globe size={14} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {user?.hackathonHistory?.map((h) => (
            <Card key={h.id} className="p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#172033]">{h.name}</h4>
                  <Badge variant="primary" size="sm">{h.position}</Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1">Project: {h.project} · {h.date}</p>
              </div>
              <span className="font-bold text-emerald-600 text-sm">+{h.reputationEarned} pts</span>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Specialization"
            value={editForm.specialization}
            onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
            required
          />
          <Input
            label="Availability"
            value={editForm.availability}
            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
            placeholder="e.g. 8-10 hours/week"
          />
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
