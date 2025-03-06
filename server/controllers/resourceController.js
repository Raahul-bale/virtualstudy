const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');

// Add resource to group
exports.addResource = async (req, res) => {
  try {
    const { groupId, title, description, type, url } = req.body;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Must be a group member to add resources.' });
    }

    group.resources.push({
      title,
      description,
      type,
      url,
      uploadedBy: req.user._id
    });

    await group.save();

    // Add XP to user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { xp: 10 }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get group resources
exports.getGroupResources = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId)
      .populate('resources.uploadedBy', 'username');

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    res.json(group.resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    const resource = group.resources.id(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Check if user is the resource uploader or a moderator
    if (!group.moderators.includes(req.user._id) && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource.' });
    }

    resource.remove();
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { title, description, type, url } = req.body;
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    const resource = group.resources.id(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Check if user is the resource uploader or a moderator
    if (!group.moderators.includes(req.user._id) && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this resource.' });
    }

    resource.title = title;
    resource.description = description;
    resource.type = type;
    resource.url = url;

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 