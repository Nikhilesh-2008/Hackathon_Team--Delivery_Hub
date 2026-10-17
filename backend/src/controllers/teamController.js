import { Team } from '../models/Team.js';
import { TeamInvitation } from '../models/TeamInvitation.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

// GET /api/teams/my-team
export const getMyTeam = async (req, res, next) => {
  try {
    let team = await Team.findOne({
      $or: [
        { captain: req.user?._id },
        { 'members.user': req.user?._id },
      ],
    }).populate('captain', 'name email avatar');

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

    const team = teamId
      ? await Team.findOne({ _id: teamId, $or: [{ captain: req.user._id }, { 'members.user': req.user._id }] })
      : await Team.findOne({ $or: [{ captain: req.user._id }, { 'members.user': req.user._id }] });
    if (!team) return res.status(404).json({ success: false, message: 'Create or join a team before sending invitations' });
    if (!receiverId || String(receiverId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'A valid teammate recipient is required' });
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ success: false, message: 'Invitation recipient was not found' });
    }
    if (team.members.some((member) => String(member.user) === String(receiverId))) {
      return res.status(409).json({ success: false, message: 'This user is already on the team' });
    }

    const invitation = await TeamInvitation.create({
      sender: req.user._id,
      senderName: req.user.name,
      receiver: receiverId,
      receiverName: receiverName || 'Peer Developer',
      team: team._id,
      teamName: team.name,
      message: message || 'Hey! Would love to invite you to our squad.',
    });

    // Create receiver notification
    await Notification.create({
      user: receiverId,
      type: 'team',
      title: 'New Team Invitation',
      message: `${req.user.name} invited you to join ${team.name}.`,
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

    if (String(invitation.receiver) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only the invited user can respond to this invitation' });
    }
    if (!['ACCEPTED', 'REJECTED'].includes(status) || invitation.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Invitation response is invalid or already recorded' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'ACCEPTED' && invitation.team) {
      await Team.findByIdAndUpdate(invitation.team, {
        $addToSet: {
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
