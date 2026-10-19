import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTeam } from '../../context/TeamContext';
import { api } from '../../services/api';
import { Users, Sparkles, Layers } from 'lucide-react';

export const CreateTeamModal = ({ isOpen, onClose, defaultEventId = null, onSuccess }) => {
  const { createTeam } = useTeam();
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId || '');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [description, setDescription] = useState('');

  // Fetch available hackathon events
  useEffect(() => {
    if (!isOpen) return;

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await api.get('/events');
        const list = res.data?.events || res.data || [];
        const activeList = list.filter((e) => e.status === 'published' || e.status === 'active');
        const available = activeList.length > 0 ? activeList : list;
        setEvents(available);

        const initialEventId = defaultEventId || available[0]?._id || available[0]?.id || '';
        setSelectedEventId(initialEventId);
      } catch (err) {
        console.error('Failed to load events for team creation', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [isOpen, defaultEventId]);

  // When selected event changes, load its specific challenges
  useEffect(() => {
    if (!selectedEventId) {
      setChallenges([]);
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const res = await api.get(`/events/${selectedEventId}`);
        const chList = res.data?.challenges || [];
        setChallenges(chList);
        if (chList.length > 0) {
          setSelectedChallengeId(chList[0]?._id || chList[0]?.id || '');
        } else {
          setSelectedChallengeId('');
        }
      } catch (err) {
        console.warn('Failed to load event challenges', err);
        setChallenges([]);
      }
    };

    fetchEventDetails();
  }, [selectedEventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedEventId) return;

    try {
      setIsSubmitting(true);
      const newTeam = await createTeam({
        name: teamName.trim(),
        eventId: selectedEventId,
        challengeId: selectedChallengeId || undefined,
        description: description.trim() || 'Hackathon squad ready to build and deliver.',
      });

      setTeamName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess(newTeam);
    } catch (err) {
      // Error handled by ToastContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Your Hackathon Squad">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
          <Users size={16} className="text-indigo-600 shrink-0" />
          <span>
            As team creator, you will automatically be designated as <strong>Team Captain</strong> and can invite teammates.
          </span>
        </div>

        <Input
          label="Team / Squad Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. CodeCrafters, Nova Squad, CyberKnights"
          required
        />

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5">
            Select Hackathon
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            required
            disabled={loadingEvents}
          >
            {events.map((evt) => (
              <option key={evt._id || evt.id} value={evt._id || evt.id}>
                {evt.name || evt.title} ({evt.mode || 'Hybrid'})
              </option>
            ))}
          </select>
        </div>

        {challenges.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">
              Target Challenge / Track
            </label>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            >
              {challenges.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title} {c.track ? `(${c.track})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5">
            Squad Pitch / Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is your team building? Describe your tech stack and vision..."
            className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Forming Squad...' : 'Create Team & Launch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
