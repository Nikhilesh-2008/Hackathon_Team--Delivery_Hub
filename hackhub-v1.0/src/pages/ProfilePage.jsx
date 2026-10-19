import React, { useState, useEffect } from 'react';
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
import { api } from '../services/api';
import {
  Award,
  Code2 as Github,
  Code,
  Globe,
  GraduationCap,
  Clock,
  Edit,
  Plus,
  Sparkles,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveProfile, setLiveProfile] = useState(null);

  // Edit state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    specialization: 'Frontend Developer',
    availability: '8-10 hrs/week',
    college: '',
    year: '',
    skills: '',
    interests: '',
    github: '',
    leetcode: '',
  });

  const loadProfile = async () => {
    try {
      const res = await api.get('/profiles/me');
      if (res?.data) {
        setLiveProfile(res.data);
      }
    } catch (err) {
      console.warn('Could not load profile from /profiles/me', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Compute active values prioritizing live backend profile then auth context user
  const currentSkills = liveProfile?.skills || user?.skills || [];
  const currentInterests = liveProfile?.interests || user?.interests || [];
  const currentCodingProfiles = liveProfile?.codingProfiles || user?.codingProfiles || {};
  const currentCertificates = liveProfile?.certificates || user?.certificates || [];
  const currentProjects = liveProfile?.projects || user?.projects || [];
  const currentName = liveProfile?.userId?.name || user?.name || 'Developer';
  const currentCollege = liveProfile?.userId?.college || user?.college || '';
  const currentYear = liveProfile?.userId?.graduationYear || user?.graduationYear || user?.year || '';
  const currentBio = liveProfile?.bio || user?.bio || '';
  const currentSpecialization = liveProfile?.specialization || user?.specialization || 'Generalist';
  const currentAvailability = liveProfile?.availability || user?.availability || '8-10 hrs/week';

  const openEditModal = (targetField = null) => {
    setEditForm({
      name: currentName,
      bio: currentBio,
      specialization: currentSpecialization,
      availability: currentAvailability,
      college: currentCollege,
      year: currentYear,
      skills: currentSkills.join(', '),
      interests: currentInterests.join(', '),
      github: currentCodingProfiles?.github || '',
      leetcode: currentCodingProfiles?.leetcode || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const skillsArray = editForm.skills
      ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const interestsArray = editForm.interests
      ? editForm.interests.split(',').map((i) => i.trim()).filter(Boolean)
      : [];

    const codingProfilesClean = {};
    if (editForm.github && editForm.github.trim()) {
      codingProfilesClean.github = editForm.github.trim();
    }
    if (editForm.leetcode && editForm.leetcode.trim()) {
      codingProfilesClean.leetcode = editForm.leetcode.trim();
    }

    const payload = {
      name: editForm.name.trim(),
      bio: editForm.bio.trim(),
      specialization: editForm.specialization,
      availability: editForm.availability.trim(),
      college: editForm.college.trim(),
      graduationYear: editForm.year.trim(),
      skills: skillsArray,
      interests: interestsArray,
      codingProfiles: codingProfilesClean,
    };

    try {
      const res = await api.patch('/profiles/me', payload);
      const updated = res.data;
      setLiveProfile(updated);
      await updateUser(payload);

      setIsEditModalOpen(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile. Please verify all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Skills' },
    { id: 'projects', label: `Projects (${currentProjects.length})` },
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
          onClick={() => openEditModal()}
          className="gap-1.5"
        >
          <Edit size={14} />
          <span>Edit Profile</span>
        </Button>
      </PageHeader>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={currentName} size="xl" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#172033]">{currentName}</h1>
              <Badge variant="primary">{currentSpecialization}</Badge>
              <Badge variant="success">Available for Hackathons</Badge>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-2">
              <GraduationCap size={15} className="text-slate-400" />
              <span>{currentCollege || 'College not specified'} · {currentYear || 'Year not specified'}</span>
            </p>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed pt-1">
              {currentBio || 'No bio provided yet. Click "Edit Profile" to share your hackathon experience and stack.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
                <Award size={14} />
                <span>Reputation: <strong>{user?.reputation || 100} pts</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                <Clock size={14} />
                <span>Commitment: <strong>{currentAvailability}</strong></span>
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
            {/* Skills & Technologies Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#172033]">Skills & Technologies</h3>
                <Button size="xs" variant="secondary" onClick={() => openEditModal('skills')} className="gap-1 text-xs">
                  <Plus size={13} />
                  <span>{currentSkills.length > 0 ? 'Edit Skills' : 'Add Skills'}</span>
                </Button>
              </div>

              {currentSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentSkills.map((s) => (
                    <Badge key={s} variant="default" size="md">{s}</Badge>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center space-y-2.5 bg-slate-50/80">
                  <p className="text-xs text-slate-500 font-medium">No skills added to your public profile yet.</p>
                  <Button size="sm" variant="primary" onClick={() => openEditModal('skills')} className="gap-1.5">
                    <Plus size={14} />
                    <span>Add Skills (e.g. React, Node.js, Python, MongoDB)</span>
                  </Button>
                </div>
              )}
            </Card>

            {/* Preferred Tracks & Interests Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#172033]">Preferred Tracks & Interests</h3>
                <Button size="xs" variant="secondary" onClick={() => openEditModal('interests')} className="gap-1 text-xs">
                  <Plus size={13} />
                  <span>{currentInterests.length > 0 ? 'Edit Tracks' : 'Add Tracks'}</span>
                </Button>
              </div>

              {currentInterests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentInterests.map((i) => (
                    <Badge key={i} variant="primary" size="md">{i}</Badge>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center space-y-2.5 bg-slate-50/80">
                  <p className="text-xs text-slate-500 font-medium">No hackathon tracks or interests selected yet.</p>
                  <Button size="sm" variant="secondary" onClick={() => openEditModal('interests')} className="gap-1.5">
                    <Plus size={14} />
                    <span>Select Tracks (e.g. AI & Education, Cloud, Web3)</span>
                  </Button>
                </div>
              )}
            </Card>

            {/* Certifications Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#172033]">Certifications</h3>
              </div>

              {currentCertificates.length > 0 ? (
                <div className="space-y-2.5">
                  {currentCertificates.map((c) => (
                    <div key={c.id || c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#172033]">{c.title}</p>
                        <p className="text-slate-500">{c.issuer}</p>
                      </div>
                      <span className="text-slate-400">{c.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50 text-xs text-slate-500">
                  No verified certifications uploaded yet.
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {/* Coding Profiles Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#172033]">Coding Profiles</h3>
                <Button size="xs" variant="secondary" onClick={() => openEditModal('profiles')} className="gap-1 text-xs">
                  <Edit size={13} />
                  <span>Edit Links</span>
                </Button>
              </div>

              {currentCodingProfiles?.github || currentCodingProfiles?.leetcode ? (
                <div className="space-y-2.5 text-xs">
                  {currentCodingProfiles.github && (
                    <a
                      href={currentCodingProfiles.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Github size={16} />
                        <span className="font-medium">GitHub</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 truncate max-w-[130px]">
                        {currentCodingProfiles.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '') || 'Profile'}
                      </span>
                    </a>
                  )}
                  {currentCodingProfiles.leetcode && (
                    <a
                      href={currentCodingProfiles.leetcode}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#172033] border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Code size={16} />
                        <span className="font-medium">LeetCode</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 truncate max-w-[130px]">
                        {currentCodingProfiles.leetcode.replace(/^https?:\/\/(www\.)?leetcode\.com\//i, '') || 'Profile'}
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center space-y-2.5 bg-slate-50/80">
                  <p className="text-xs text-slate-500 font-medium">Link your GitHub & LeetCode to boost team invitations.</p>
                  <Button size="xs" variant="secondary" onClick={() => openEditModal('profiles')} className="gap-1 text-xs">
                    <LinkIcon size={13} />
                    <span>Connect Profiles</span>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentProjects.length > 0 ? (
            currentProjects.map((p) => (
              <Card key={p.id || p._id} className="p-5 flex flex-col justify-between">
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
            ))
          ) : (
            <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <BookOpen className="mx-auto text-slate-400" size={32} />
              <p className="text-sm font-semibold text-slate-700">No Projects Added Yet</p>
              <p className="text-xs text-slate-500">Your delivered hackathon deliverables and GitHub projects will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {(user?.hackathonHistory || []).length > 0 ? (
            user.hackathonHistory.map((h) => (
              <Card key={h.id || h._id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#172033]">{h.name}</h4>
                    <Badge variant="primary" size="sm">{h.position}</Badge>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">Project: {h.project} · {h.date}</p>
                </div>
                <span className="font-bold text-emerald-600 text-sm">+{h.reputationEarned} pts</span>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Award className="mx-auto text-slate-400" size={32} />
              <p className="text-sm font-semibold text-slate-700">No Hackathon History Yet</p>
              <p className="text-xs text-slate-500">Join active hackathons to earn placement badges and reputation points.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Developer Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="e.g. Karthik Patel"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Specialization / Role</label>
            <select
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="AI/ML Developer">AI/ML Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="DevOps Developer">DevOps Developer</option>
              <option value="Database Developer">Database Developer</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="IoT Developer">IoT Developer</option>
              <option value="Generalist">Generalist</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="College / University"
              value={editForm.college}
              onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
              placeholder="e.g. VNR VJIET"
            />
            <Input
              label="Graduation Year / Semester"
              value={editForm.year}
              onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
              placeholder="e.g. 2026, 4th Year"
            />
          </div>

          <div>
            <Input
              label="Skills & Technologies (Comma-separated)"
              value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
              placeholder="e.g. React, Node.js, Python, MongoDB, Docker, TypeScript"
            />
            <p className="text-[11px] text-slate-400 mt-1">Separate skills with commas (e.g. React, Node.js, Python, MongoDB).</p>
          </div>

          <div>
            <Input
              label="Preferred Tracks & Interests (Comma-separated)"
              value={editForm.interests}
              onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
              placeholder="e.g. AI/ML, Cloud Infrastructure, FinTech, Web3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Profile URL (Optional)"
              value={editForm.github}
              onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
              placeholder="https://github.com/username"
            />
            <Input
              label="LeetCode Profile URL (Optional)"
              value={editForm.leetcode}
              onChange={(e) => setEditForm({ ...editForm, leetcode: e.target.value })}
              placeholder="https://leetcode.com/username"
            />
          </div>

          <Input
            label="Weekly Availability / Commitment"
            value={editForm.availability}
            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
            placeholder="e.g. 8-10 hrs/week"
          />

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Bio & About Me</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Write a brief intro about your experience, past hackathons, or tech stack..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
