import React, { useEffect, useMemo, useState } from 'react';
import { Check, LoaderCircle, Search, Send, Users } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import { useTeam } from '../../context/TeamContext';

const defaultMessage = (teamName) => `Let's team up for this hackathon! Join ${teamName || 'our team'}.`;

export const RegisterEventModal = ({ isOpen, onClose, event, onRegistered }) => {
  const { reloadTeam } = useTeam();
  const [teamName, setTeamName] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const challenges = event?.challenges || [];
  const maxInvites = Math.max((event?.maxTeamSize || 4) - 1, 0);

  useEffect(() => {
    if (!isOpen) return;
    setTeamName('');
    setDescription('');
    setChallengeId(challenges[0]?.id || challenges[0]?._id || '');
    setSelectedIds([]);
    setQuery('');
    setError('');
    setInviteMessage('');
    setIsSubmitting(false);
  }, [isOpen, event?.id]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoadingCandidates(true);
      try {
        const response = await api.post('/discovery/teammates', {
          query: query.trim(),
          limit: 24,
        });
        if (active) setCandidates(response.data || []);
      } catch (fetchError) {
        if (active) setCandidates([]);
      } finally {
        if (active) setIsLoadingCandidates(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, query]);

  const selectedCandidates = useMemo(
    () => candidates.filter((candidate) => selectedIds.includes(candidate.id)),
    [candidates, selectedIds]
  );

  const toggleCandidate = (candidateId) => {
    setError('');
    setSelectedIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }
      if (current.length >= maxInvites) {
        setError(`This event allows up to ${event?.maxTeamSize || 4} members per team, so you can invite at most ${maxInvites}.`);
        return current;
      }
      return [...current, candidateId];
    });
  };

  const resendMessage = () => defaultMessage(teamName);

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!teamName.trim()) {
      setError('Please enter a team name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const teamResponse = await api.post('/teams', {
        eventId: event.id || event._id,
        challengeId: challengeId || undefined,
        name: teamName.trim(),
        description: description.trim() || 'Hackathon squad ready to build and deliver.',
      });

      const createdTeam = teamResponse.data?.team || teamResponse.data;
      const teamId = createdTeam?._id || createdTeam?.id;

      let sent = 0;
      const failed = [];
      const note = inviteMessage.trim() || defaultMessage(teamName.trim());

      for (const candidateId of selectedIds) {
        try {
          await api.post(`/teams/${teamId}/invitations`, {
            inviteeId: candidateId,
            message: note,
          });
          sent += 1;
        } catch (inviteError) {
          const candidate = candidates.find((item) => item.id === candidateId);
          failed.push(`${candidate?.name || 'Member'}: ${inviteError.message}`);
        }
      }

      // Refresh the global team context so the workspace reflects the new squad immediately
      await reloadTeam?.();

      onRegistered?.({
        teamId,
        teamName: teamName.trim(),
        invitesSent: sent,
        inviteFailures: failed,
      });
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register for ${event?.title || 'Hackathon'}`}
      description="Create your team, pick a challenge track, and invite available members."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
          <Users size={16} className="text-indigo-600 shrink-0 mt-0.5" />
          <span>
            You will be registered as <strong>Team Captain</strong>. Selected members receive an in-app invitation and join the team once they accept.
          </span>
        </div>

        <Input
          label="Team / Squad name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. CodeCrafters, Nova Squad"
          required
          minLength={2}
          maxLength={80}
        />

        {challenges.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Target challenge / track</label>
            <select
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#4F46E5]"
            >
              {challenges.map((challenge) => (
                <option key={challenge.id || challenge._id} value={challenge.id || challenge._id}>
                  {challenge.title}{challenge.track ? ` (${challenge.track})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5">Squad pitch (optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you building? Describe your tech stack and vision…"
            className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="block text-xs font-semibold text-[#172033]">
              Invite teammates {maxInvites > 0 ? `(up to ${maxInvites})` : ''}
            </label>
            <span className="text-[11px] text-slate-500">{selectedIds.length} selected</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by skill, role, or name…"
              className="w-full bg-transparent text-xs text-[#172033] placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
            {isLoadingCandidates ? (
              <p className="px-3 py-3 text-xs text-slate-500">Finding available members…</p>
            ) : candidates.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-500">No available members match this search. You can register solo and invite later.</p>
            ) : (
              candidates.map((candidate) => {
                const selected = selectedIds.includes(candidate.id);
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => toggleCandidate(candidate.id)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors ${selected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#172033] truncate">
                        {candidate.name}
                        {candidate.college ? <span className="font-normal text-slate-500"> · {candidate.college}</span> : null}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {candidate.specialization || 'Participant'}
                        {candidate.skills?.length ? ` · ${candidate.skills.slice(0, 3).join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {candidate.availability && <Badge variant="default" size="sm">{candidate.availability}</Badge>}
                      <span className={`grid h-5 w-5 place-items-center rounded-md border ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {selected && <Check size={12} />}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {selectedCandidates.length > 0 && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Invitation note
                <button type="button" onClick={() => setInviteMessage(resendMessage())} className="ml-2 text-[11px] font-medium text-indigo-600 hover:underline">
                  use default
                </button>
              </label>
              <textarea
                rows={2}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={defaultMessage(teamName)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
            {isSubmitting ? 'Registering…' : selectedIds.length > 0 ? `Register & invite ${selectedIds.length}` : 'Register team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterEventModal;
