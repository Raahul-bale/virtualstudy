const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');

// Create new study group
exports.createGroup = async (req, res) => {
  try {
    const { name, subject, description, schedule } = req.body;

    const group = new StudyGroup({
      name,
      subject,
      description,
      schedule,
      creator: req.user._id,
      members: [req.user._id],
      moderators: [req.user._id]
    });

    await group.save();

    // Add group to user's study groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { studyGroups: group._id }
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all study groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate('creator', 'username')
      .populate('members', 'username')
      .populate('moderators', 'username');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('creator', 'username')
      .populate('members', 'username')
      .populate('moderators', 'username')
      .populate('resources.uploadedBy', 'username')
      .populate('chat.user', 'username');

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Join study group
exports.joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group.' });
    }

    group.members.push(req.user._id);
    await group.save();

    // Add group to user's study groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { studyGroups: group._id }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Leave study group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this group.' });
    }

    // Remove user from members and moderators
    group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
    group.moderators = group.moderators.filter(moderator => moderator.toString() !== req.user._id.toString());

    await group.save();

    // Remove group from user's study groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { studyGroups: group._id }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add moderator
exports.addModerator = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (!group.moderators.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add moderators.' });
    }

    const { userId } = req.body;

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'User must be a member to become a moderator.' });
    }

    if (group.moderators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a moderator.' });
    }

    group.moderators.push(userId);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 