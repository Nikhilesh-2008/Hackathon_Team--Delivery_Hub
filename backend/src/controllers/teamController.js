import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { TeamInvitation } from '../models/TeamInvitation.js';
import { Notification } from '../models/Notification.js';

// GET /api/teams/my-team
export const getMyTeam = async (req, res, next) => {
  try {
    let team = await Team.findOne({
      $or: [
        { captain: req.user?._id },
        { 'members.user': req.user?._id },
      ],
    }).populate('captain', 'name email avatar');

    if (!team) {
      // Return default active team for demonstration if user has no assigned team
      team = await Team.findOne().populate('captain', 'name email avatar');
    }

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// GET /api/teams
export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('captain', 'name email avatar');
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    next(error);
  }
};

// POST /api/teams
export const createTeam = async (req, res, next) => {
  try {
    const { name, eventId, hackathonTitle, challengeTitle, description } = req.body;
    const team = await Team.create({
      name,
      event: eventId || null,
      hackathonTitle: hackathonTitle || 'NexusHack 2026',
      challengeTitle: challengeTitle || 'Adaptive Study Engine',
      description,
      captain: req.user._id,
      progress: 0,
      members: [
        {
          user: req.user._id,
          name: req.user.name,
          role: 'Team Captain',
          isCaptain: true,
          skills: ['Full Stack'],
        },
      ],
    });

    res.status(201).json({ success: true, message: 'Team created successfully', data: team });
  } catch (error) {
    next(error);
  }
};

// POST /api/teams/invitations
export const sendInvitation = async (req, res, next) => {
  try {
    const { receiverId, receiverName, message, teamId } = req.body;

    const team = teamId ? await Team.findById(teamId) : await Team.findOne();

    const invitation = await TeamInvitation.create({
      sender: req.user ? req.user._id : '660000000000000000000001',
      senderName: req.user ? req.user.name : 'Karthik',
      receiver: receiverId,
      receiverName: receiverName || 'Peer Developer',
      team: team ? team._id : null,
      teamName: team ? team.name : 'Team Nova',
      message: message || 'Hey! Would love to invite you to our squad.',
    });

    // Create receiver notification
    await Notification.create({
      user: receiverId,
      type: 'team',
      title: 'New Team Invitation',
      message: `${req.user ? req.user.name : 'Team Captain'} invited you to join ${team ? team.name : 'Team Nova'}.`,
      link: '/team',
    });

    res.status(201).json({ success: true, message: 'Team invitation sent successfully!', data: invitation });
  } catch (error) {
    next(error);
  }
};

// GET /api/teams/invitations
export const getInvitations = async (req, res, next) => {
  try {
    const invitations = await TeamInvitation.find({
      $or: [{ receiver: req.user?._id }, { sender: req.user?._id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/teams/invitations/:id
export const respondInvitation = async (req, res, next) => {
  try {
    const { status } = req.body; // 'ACCEPTED' | 'REJECTED'
    const invitation = await TeamInvitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'ACCEPTED' && invitation.team) {
      await Team.findByIdAndUpdate(invitation.team, {
        $push: {
          members: {
            user: invitation.receiver,
            name: invitation.receiverName,
            role: 'Developer',
            isCaptain: false,
            joinedAt: new Date(),
          },
        },
      });
    }

    res.status(200).json({ success: true, message: `Invitation ${status.toLowerCase()}`, data: invitation });
  } catch (error) {
    next(error);
  }
};
