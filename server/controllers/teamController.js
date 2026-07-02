const Team = require('../models/Team');
const User = require('../models/User');
const { reviewCode } = require('../services/aiService');
const crypto = require('crypto');

// Create a team
exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await Team.create({
      name,
      ownerId: req.user.id,
      inviteCode,
      members: [{
        userId: req.user.id,
        name: user.name,
        email: user.email
      }]
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Join team with invite code
exports.joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const user = await User.findById(req.user.id);

    const team = await Team.findOne({ inviteCode });
    if (!team) return res.status(404).json({ message: 'Invalid invite code' });

    // Check if already a member
    const alreadyMember = team.members.some(
      m => m.userId.toString() === req.user.id
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    team.members.push({
      userId: req.user.id,
      name: user.name,
      email: user.email
    });

    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my teams
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.userId': req.user.id
    }).select('-snippets');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single team with snippets
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some(
      m => m.userId.toString() === req.user.id
    );
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Share snippet to team
exports.shareSnippet = async (req, res) => {
  try {
    const { code, language } = req.body;
    const user = await User.findById(req.user.id);
    const team = await Team.findById(req.params.id);

    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some(
      m => m.userId.toString() === req.user.id
    );
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    // Get AI review
    const aiReview = await reviewCode(code, language);

    const snippet = {
      code,
      language,
      sharedBy: user.name,
      userId: req.user.id,
      aiReview,
      comments: []
    };

    team.snippets.unshift(snippet);
    await team.save();

    const savedSnippet = team.snippets[0];

    // Emit to all team members via socket
    req.io.to(`team-${team._id}`).emit('new-snippet', savedSnippet);

    res.status(201).json(savedSnippet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to share snippet' });
  }
};

// Add comment to snippet
exports.addComment = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const { text } = req.body;
    const user = await User.findById(req.user.id);
    const team = await Team.findById(req.params.id);

    if (!team) return res.status(404).json({ message: 'Team not found' });

    const snippet = team.snippets.id(snippetId);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    const comment = {
      userId: req.user.id,
      userName: user.name,
      text,
      createdAt: new Date()
    };

    snippet.comments.push(comment);
    await team.save();

    const savedComment = snippet.comments[snippet.comments.length - 1];

    // Emit to team room
    req.io.to(`team-${team._id}`).emit('new-comment', {
      snippetId,
      comment: savedComment
    });

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};