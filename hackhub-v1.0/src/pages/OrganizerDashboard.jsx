import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Layers,
  Users,
  Calendar,
  Send,
  Plus,
  Settings,
  MapPin,
  Trophy
} from 'lucide-react';

export const OrganizerDashboard = () => {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewEventModal, setIsNewEventModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('Collegiate hackathon sprint focusing on cutting-edge software and rapid prototyping.');
  const [newPrize, setNewPrize] = useState('₹2,00,000');
  const [newTrack, setNewTrack] = useState('AI/ML');
  const [newLocation, setNewLocation] = useState('Hybrid / Campus Auditorium');
  const [newStartDate, setNewStartDate] = useState('2026-11-20T09:00');
  const [newEndDate, setNewEndDate] = useState('2026-11-22T18:00');
  const [newRegDeadline, setNewRegDeadline] = useState('2026-11-15T23:59');
  const [newSubDeadline, setNewSubDeadline] = useState('2026-11-22T16:00');

  const { showSuccess, showError } = useToast();

  const loadEvents = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get('/organizer/events');
      } catch {
        res = await api.get('/events');
      }
      const data = res?.data || [];
      setEventsList(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error('Failed to load organizer events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: newTitle.trim(),
        description: newDescription.trim() || 'Exciting hackathon sprint organized by campus leads.',
        prizePool: newPrize.trim(),
        categories: [newTrack.trim() || 'Open Innovation'],
        location: newLocation.trim() || 'Hybrid',
        mode: 'hybrid',
        minTeamSize: 2,
        maxTeamSize: 4,
        startDate: new Date(newStartDate).toISOString(),
        endDate: new Date(newEndDate).toISOString(),
        registrationDeadline: new Date(newRegDeadline).toISOString(),
        submissionDeadline: new Date(newSubDeadline).toISOString(),
        status: 'published',
      };

      const res = await api.post('/events', payload);
      const created = res.data;

      setEventsList((prev) => [created, ...prev]);
      setIsNewEventModal(false);
      setNewTitle('');
      showSuccess(`"${payload.name}" successfully created and published!`);
    } catch (err) {
      showError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEvents = eventsList.filter((e) => e.status === 'published' || e.status === 'active');

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
        <StatCard label="Active Events" value={activeEvents.length} icon={Layers} color="emerald" />
        <StatCard label="Registered Teams" value="48 Squads" icon={Users} color="sky" />
        <StatCard label="Pending Submissions" value="18 Projects" icon={Send} color="amber" />
      </div>

      {/* Events Manager Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-bold text-[#172033]">
            Managed Hackathons
          </h3>
          <span className="text-xs text-slate-500 font-medium">{eventsList.length} total events</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading hackathons...</div>
        ) : eventsList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl space-y-2">
            <Trophy className="mx-auto text-slate-400" size={32} />
            <p className="text-sm font-semibold text-slate-700">No Hackathons Created Yet</p>
            <p className="text-xs text-slate-500">Click "Create Hackathon" above to launch your first collegiate event.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsList.map((h) => {
              const id = h.id || h._id;
              const name = h.name || h.title;
              const startFormatted = h.startDate ? new Date(h.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming';
              const endFormatted = h.endDate ? new Date(h.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

              return (
                <div key={id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#172033]">{name}</h4>
                      <Badge variant={h.status === 'published' || h.status === 'active' ? 'success' : 'primary'} size="sm">
                        {h.status || 'Active'}
                      </Badge>
                      {h.categories?.[0] && (
                        <Badge variant="default" size="sm">
                          {h.categories[0]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-2 flex-wrap">
                      <span>Prize: <strong className="text-emerald-700">{h.prizePool || '₹2,00,000'}</strong></span>
                      <span>·</span>
                      <span>{startFormatted} {endFormatted ? `to ${endFormatted}` : ''}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {h.location || 'Hybrid'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.location.href = `/events/${id}`}>
                      View Event
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Description</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the objective and format of this hackathon..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
              required
            />
          </div>

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

          <Input
            label="Location / Venue"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="e.g. Hybrid / Main Campus Auditorium"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Registration Deadline</label>
              <input
                type="datetime-local"
                value={newRegDeadline}
                onChange={(e) => setNewRegDeadline(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Project Submission Deadline</label>
              <input
                type="datetime-local"
                value={newSubDeadline}
                onChange={(e) => setNewSubDeadline(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNewEventModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
