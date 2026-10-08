import { Submission, Team, Event, Membership, AuditLog } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getSubmissionChecklist = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const event = await Event.findById(team.eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  const submission = await Submission.findOne({ teamId: team._id });
  const serverTime = new Date();
  const deadline = new Date(event.submissionDeadline);
  const isDeadlinePassed = serverTime.getTime() > deadline.getTime();

  const checklist = {
    githubRepo: Boolean(submission?.repositoryUrl),
    deploymentLink: Boolean(submission?.deploymentUrl),
    projectDescription: Boolean(submission?.description && submission.description.length >= 10),
    presentationDeck: Boolean(submission?.presentationUrl),
    demoVideo: Boolean(submission?.demoVideoUrl),
    finalTesting: Boolean(submission?.checklist?.finalTesting),
  };

  const keys = Object.keys(checklist);
  const completed = keys.filter((k) => checklist[k]).length;
  const readinessPercentage = Math.round((completed / keys.length) * 100);

  return {
    teamId: team._id,
    submissionId: submission?._id || null,
    status: submission?.status || 'draft',
    readinessPercentage: submission?.readinessPercentage || readinessPercentage,
    serverTime: serverTime.toISOString(),
    isDeadlinePassed,
    deadline: event.submissionDeadline,
    isLocked: event.status === 'locked' || submission?.status === 'locked',
    checklist,
  };
};

export const getTeamSubmission = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const submission = await Submission.findOne({ teamId: team._id })
    .populate('eventId', 'name submissionDeadline status')
    .populate('challengeId', 'title track problemStatement');

  return submission;
};

export const upsertSubmission = async (teamId, user, payload) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const event = await Event.findById(team.eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  // Captain validation
  const membership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!membership || membership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can save or finalize project submission', 403);
  }

  // Server-side deadline enforcement: NEVER trust frontend timestamp
  const now = new Date();
  if (now.getTime() > new Date(event.submissionDeadline).getTime()) {
    throw new AppError('FORBIDDEN', 'Official hackathon submission deadline has passed. Submissions are closed.', 403);
  }

  if (event.status === 'locked') {
    throw new AppError('FORBIDDEN', 'Submissions for this event are locked by the organizer.', 403);
  }

  let submission = await Submission.findOne({ teamId: team._id });
  if (submission && submission.status === 'locked') {
    throw new AppError('FORBIDDEN', 'This submission has been officially locked and cannot be edited.', 403);
  }

  const isFinalSubmit = payload.action === 'SUBMIT';
  const submissionData = {
    eventId: event._id,
    teamId: team._id,
    challengeId: payload.challengeId || team.challengeId,
    description: payload.description || (submission ? submission.description : 'Pending project description'),
    repositoryUrl: payload.repositoryUrl || payload.githubUrl || (submission ? submission.repositoryUrl : 'https://github.com/placeholder'),
    deploymentUrl: payload.deploymentUrl || payload.liveUrl || (submission ? submission.deploymentUrl : 'https://placeholder.app'),
    demoVideoUrl: payload.demoVideoUrl || (submission ? submission.demoVideoUrl : ''),
    presentationUrl: payload.presentationUrl || (submission ? submission.presentationUrl : ''),
    checklist: payload.checklist || (submission ? submission.checklist : {}),
    evidence: payload.evidence || (submission ? submission.evidence : []),
  };

  if (isFinalSubmit) {
    submissionData.status = 'submitted';
    submissionData.submittedAt = now;
  }

  if (!submission) {
    submission = await Submission.create({
      ...submissionData,
      revision: 1,
    });
  } else {
    Object.assign(submission, submissionData);
    if (isFinalSubmit) {
      submission.revision += 1;
    }
    await submission.save();
  }

  await AuditLog.create({
    eventId: event._id,
    actorId: user._id,
    actorRole: user.role,
    action: isFinalSubmit ? 'SUBMISSION_FINALIZED' : 'SUBMISSION_DRAFT_SAVED',
    entityType: 'Submission',
    entityId: submission._id,
    reason: isFinalSubmit ? 'Final project submission by captain' : 'Draft submission updated',
    metadata: {
      revision: submission.revision,
      status: submission.status,
    },
  });

  return submission;
};

export const updateSubmissionDraft = async (teamId, user, payload) => {
  return upsertSubmission(teamId, user, { ...payload, action: 'SAVE_DRAFT' });
};

export const getSubmissionById = async (submissionId) => {
  const submission = await Submission.findById(submissionId)
    .populate('teamId', 'name createdBy')
    .populate('eventId', 'name submissionDeadline status')
    .populate('challengeId', 'title track problemStatement');

  if (!submission) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Submission not found', 404);
  }

  return submission;
};

export const submitFinalSubmission = async (submissionId, user) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Submission not found', 404);
  }

  return upsertSubmission(submission.teamId, user, { action: 'SUBMIT' });
};

export default {
  getSubmissionChecklist,
  getTeamSubmission,
  upsertSubmission,
  updateSubmissionDraft,
  getSubmissionById,
  submitFinalSubmission,
};
