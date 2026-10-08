import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { hackathons } from '../data/events';
import {
  Layers,
  Users,
  Calendar,
  Send,
  Plus,
  Settings,
  BookOpen,
  Award
} from 'lucide-react';

export const OrganizerDashboard = () => {
  const [eventsList, setEventsList] = useState(hackathons);
  const [isNewEventModal, setIsNewEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrize, setNewPrize] = useState('₹2,00,000');
  const [newTrack, setNewTrack] = useState('AI/ML');
  const { showSuccess } = useToast();

  const handleCreateHackathon = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newH = {
      id: `hack_${Date.now()}`,
      title: newTitle.trim(),
      organizer: "Student Tech Committee",
      tags: [newTrack, "Open Innovation"],
      category: newTrack,
      status: "Upcoming",
      registrationStatus: "Open",
      startDate: "Nov 20, 2026",
      endDate: "Nov 22, 2026",
      location: "Hybrid / Campus Auditorium",
      prizePool: newPrize,
      teamSize: "2 - 4 Members",
      challengeCount: 2,
      description: "Exciting new collegiate hackathon sprint organized by campus leads.",
      challenges: []
    };

    setEventsList([newH, ...eventsList]);
    setIsNewEventModal(false);
    showSuccess("New Hackathon created and published!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Management Console"
        subtitle="Manage collegiate hackathons, track registrant statistics, and oversee judging pipelines."
        badge={<Badge variant="primary">Lead Organizer Mode</Badge>}
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewEventModal(true)}
          className="gap-1.5"
        >
          <Plus size={15} />
          <span>Create Hackathon</span>
        </Button>
      </PageHeader>

      {/* Organizer Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Hackathons" value={eventsList.length} icon={Calendar} color="indigo" />
        <StatCard label="Active Challenges" value="12 Tracks" icon={Layers} color="emerald" />
        <StatCard label="Registered Teams" value="48 Squads" icon={Users} color="sky" />
        <StatCard label="Pending Submissions" value="18 Projects" icon={Send} color="amber" />
      </div>

      {/* Events Manager Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-[#E2E8F0]">
          Active & Upcoming Hackathons
        </h3>

        <div className="space-y-3">
          {eventsList.map((h) => (
            <div key={h.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#172033]">{h.title}</h4>
                  <Badge variant={h.status === 'Active' ? 'success' : 'primary'} size="sm">
                    {h.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Prize: <strong className="text-emerald-700">{h.prizePool}</strong> · {h.startDate} to {h.endDate} · {h.location}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  Manage Tracks
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Hackathon Modal */}
      <Modal
        isOpen={isNewEventModal}
        onClose={() => setIsNewEventModal(false)}
        title="Create New Hackathon"
      >
        <form onSubmit={handleCreateHackathon} className="space-y-4">
          <Input
            label="Hackathon Name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. AI NextGen Sprint 2026"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prize Pool"
              value={newPrize}
              onChange={(e) => setNewPrize(e.target.value)}
              placeholder="e.g. ₹2,00,000"
            />
            <Input
              label="Primary Track"
              value={newTrack}
              onChange={(e) => setNewTrack(e.target.value)}
              placeholder="e.g. AI / Web / Cloud"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNewEventModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
