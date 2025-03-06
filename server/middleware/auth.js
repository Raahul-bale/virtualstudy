const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

const isModerator = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (!group.moderators.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. Moderator privileges required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { auth, isModerator }; 