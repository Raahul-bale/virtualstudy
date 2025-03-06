const StudySession = require('../models/StudySession');
const StudyGroup = require('../models/StudyGroup');

// Create new study session
exports.createSession = async (req, res) => {
  try {
    const { groupId, title, description, startTime, endTime } = req.body;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Study group not found.' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Must be a group member to create sessions.' });
    }

    const session = new StudySession({
      group: groupId,
      title,
      description,
      startTime,
      endTime,
      participants: [{ user: req.user._id }]
    });

    await session.save();

    // Add session to group's active sessions
    group.activeSessions.push(session._id);
    await group.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id)
      .populate('group', 'name subject')
      .populate('participants.user', 'username')
      .populate('notes.createdBy', 'username')
      .populate('flashcards.createdBy', 'username');

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Join study session
exports.joinSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active.' });
    }

    // Check if user is already a participant
    const isParticipant = session.participants.some(
      participant => participant.user.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({ message: 'Already joined this session.' });
    }

    session.participants.push({ user: req.user._id });
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Leave study session
exports.leaveSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    const participant = session.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({ message: 'Not a participant in this session.' });
    }

    participant.leaveTime = new Date();
    participant.focusTime = (participant.leaveTime - participant.joinTime) / 1000 / 60; // in minutes
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add note to session
exports.addNote = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    const { content } = req.body;

    session.notes.push({
      content,
      createdBy: req.user._id
    });

    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add flashcard to session
exports.addFlashcard = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    const { question, answer } = req.body;

    session.flashcards.push({
      question,
      answer,
      createdBy: req.user._id
    });

    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update whiteboard
exports.updateWhiteboard = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Study session not found.' });
    }

    const { whiteboard } = req.body;
    session.whiteboard = whiteboard;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 