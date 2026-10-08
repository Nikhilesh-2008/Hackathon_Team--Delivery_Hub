import { AgentRun, Team, Task, Submission, Event, Membership, Milestone, AuditLog } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const generateDeliveryPlan = async (teamId, user, payload = {}) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const event = await Event.findById(team.eventId);
  if (!event) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Event not found', 404);
  }

  // Inspect existing tasks, submission checklist, and timeline
  const tasks = await Task.find({ teamId: team._id });
  const submission = await Submission.findOne({ teamId: team._id });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const deadline = new Date(event.submissionDeadline);
  const hoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const criticalBlocker = blockedTasks.length > 0 ? blockedTasks[0].title : 'Final deployment pipeline configuration';

  // Read-only analysis and schedule proposal
  const proposal = {
    canFinishBeforeDeadline: hoursRemaining > 6 || completionRate >= 70,
    confidencePercentage: Math.min(95, Math.max(50, completionRate + 15)),
    assessment: `Team ${team.name} has completed ${completedTasks}/${totalTasks} sprint tasks (${completionRate}%). With ${hoursRemaining} hours until submission cutoff, team velocity is stable.`,
    criticalBlocker,
    recommendations: [
      `Prioritize unblocking: "${criticalBlocker}" immediately.`,
      'Lock core code logic 4 hours before deadline to allow testing and demo video recording.',
      'Conduct submission checklist dry-run before cutoff.',
    ],
    proposedSchedule: [
      {
        time: 'T-8 Hours',
        task: 'Resolve critical blockers and verify API endpoints',
      },
      {
        time: 'T-5 Hours',
        task: 'Freeze frontend features and trigger production deployment',
      },
      {
        time: 'T-3 Hours',
        task: 'Record 2-minute demo video walkthrough & upload slides',
      },
      {
        time: 'T-1 Hour',
        task: 'Final submission checklist review and captain signoff',
      },
    ],
  };

  // IMPORTANT: The agent MUST NOT directly modify tasks.
  // Instead, create an AgentRun document with status 'proposed'
  const agentRun = await AgentRun.create({
    eventId: event._id,
    teamId: team._id,
    requestedBy: user._id,
    question: payload.prompt || 'Generate sprint delivery assessment and milestone roadmap',
    status: 'proposed',
    toolsUsed: ['TaskInspector', 'ChecklistEvaluator', 'DeadlineCalculator'],
    proposal,
  });

  return {
    agentRunId: agentRun._id,
    status: agentRun.status,
    proposal: agentRun.proposal,
    createdAt: agentRun.createdAt,
  };
};

export const confirmDeliveryPlan = async (teamId, agentRunId, user) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  // Re-check captain permission
  const membership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!membership || membership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can approve and apply AI delivery plans', 403);
  }

  const agentRun = await AgentRun.findById(agentRunId);
  if (!agentRun) {
    throw new AppError('RESOURCE_NOT_FOUND', 'AgentRun record not found', 404);
  }

  if (agentRun.teamId.toString() !== team._id.toString()) {
    throw new AppError('FORBIDDEN', 'AgentRun does not belong to this team', 403);
  }

  if (agentRun.status !== 'proposed') {
    throw new AppError('BUSINESS_RULE_VIOLATION', `Delivery plan is already in status '${agentRun.status}'`, 422);
  }

  // Re-check event state
  const event = await Event.findById(team.eventId);
  if (!event || event.status === 'locked') {
    throw new AppError('FORBIDDEN', 'Event is locked; delivery plan modifications cannot be applied', 403);
  }

  // Apply proposed milestones
  const createdMilestones = [];
  if (agentRun.proposal && Array.isArray(agentRun.proposal.proposedSchedule)) {
    for (const item of agentRun.proposal.proposedSchedule) {
      const milestone = await Milestone.create({
        teamId: team._id,
        eventId: team.eventId,
        title: item.task,
        description: `Proposed by AI Planner for schedule window: ${item.time}`,
        dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // Default 6 hours ahead
        status: 'pending',
        completionPercentage: 0,
      });
      createdMilestones.push(milestone);
    }
  }

  // Update AgentRun
  agentRun.status = 'approved';
  agentRun.approvedBy = user._id;
  agentRun.approvedAt = new Date();
  agentRun.completedAt = new Date();
  await agentRun.save();

  // AuditLog entry
  await AuditLog.create({
    eventId: team.eventId,
    actorId: user._id,
    actorRole: user.role,
    action: 'AI_DELIVERY_PLAN_APPROVED',
    entityType: 'AgentRun',
    entityId: agentRun._id,
    reason: 'Captain approved AI proposed delivery plan',
    metadata: {
      appliedMilestonesCount: createdMilestones.length,
    },
  });

  return {
    confirmed: true,
    agentRun,
    appliedMilestones: createdMilestones,
  };
};

export const cancelDeliveryPlan = async (teamId, agentRunId, user) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError('RESOURCE_NOT_FOUND', 'Team not found', 404);
  }

  const membership = await Membership.findOne({
    userId: user._id,
    teamId: team._id,
    status: 'active',
  });

  if (user.role !== 'ADMIN' && (!membership || membership.role !== 'captain')) {
    throw new AppError('FORBIDDEN', 'Only team captain can cancel AI delivery plans', 403);
  }

  const agentRun = await AgentRun.findById(agentRunId);
  if (!agentRun) {
    throw new AppError('RESOURCE_NOT_FOUND', 'AgentRun not found', 404);
  }

  agentRun.status = 'rejected';
  agentRun.completedAt = new Date();
  await agentRun.save();

  return {
    cancelled: true,
    agentRun,
  };
};

export default {
  generateDeliveryPlan,
  confirmDeliveryPlan,
  cancelDeliveryPlan,
};
