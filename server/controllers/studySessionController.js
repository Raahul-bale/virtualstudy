const StudySession = require('../models/StudySession');
const StudyGroup = require('../models/StudyGroup');
const { updateUserStats } = require('./leaderboardController');

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

// Delete a study session
exports.deleteSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Only allow creator to delete the session
    if (session.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only session creator can delete the session.' });
    }

    // Update leaderboard stats for all participants before deleting
    for (const participant of session.participants) {
      if (participant.leaveTime) {
        await updateUserStats(participant.user, session._id);
      }
    }

    // Remove session from group's active sessions
    const group = await StudyGroup.findById(session.group);
    if (group) {
      group.activeSessions = group.activeSessions.filter(
        sessionId => sessionId.toString() !== session._id.toString()
      );
      await group.save();
    }

    await session.remove();
    res.json({ message: 'Session deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Join a study session
exports.joinSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Check if user is already in the session
    const existingParticipant = session.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (existingParticipant) {
      return res.status(400).json({ message: 'Already joined this session.' });
    }

    // Add user to participants with join time
    session.participants.push({
      user: req.user._id,
      joinTime: new Date(),
      focusTime: 0
    });

    await session.save();

    // Update session status if it's the first participant
    if (session.status === 'scheduled') {
      session.status = 'active';
      await session.save();
    }

    // Emit socket event for real-time updates
    req.app.get('io').to(session._id.toString()).emit('participant-joined', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Leave a study session
exports.leaveSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Find the participant
    const participant = session.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({ message: 'Not a participant in this session.' });
    }

    // Calculate focus time in minutes
    const leaveTime = new Date();
    const focusTime = Math.floor((leaveTime - participant.joinTime) / (1000 * 60));

    // Update participant's leave time and focus time
    participant.leaveTime = leaveTime;
    participant.focusTime = focusTime;

    await session.save();

    // Update leaderboard stats
    await updateUserStats(req.user._id, session._id);

    // Emit socket event for real-time updates
    req.app.get('io').to(session._id.toString()).emit('participant-left', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get session details
exports.getSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id)
      .populate('participants.user', 'username avatar')
      .populate('group', 'name subject');

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

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

// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
  try {
    const sessions = await StudySession.find()
      .populate('participants.user', 'username avatar')
      .select('participants');

    // Calculate total focus time for each user
    const userStats = {};
    
    sessions.forEach(session => {
      session.participants.forEach(participant => {
        if (!userStats[participant.user._id]) {
          userStats[participant.user._id] = {
            username: participant.user.username,
            avatar: participant.user.avatar,
            totalHours: 0,
            totalSessions: 0,
            streak: 0,
            lastSessionDate: null
          };
        }
        // Add focus time in hours (converting from minutes)
        userStats[participant.user._id].totalHours += (participant.focusTime || 0) / 60;
        userStats[participant.user._id].totalSessions += 1;

        // Calculate streak
        const sessionDate = new Date(participant.joinTime).toDateString();
        if (userStats[participant.user._id].lastSessionDate) {
          const lastDate = new Date(userStats[participant.user._id].lastSessionDate);
          const currentDate = new Date(sessionDate);
          const diffTime = Math.abs(currentDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            userStats[participant.user._id].streak += 1;
          } else if (diffDays > 1) {
            userStats[participant.user._id].streak = 1;
          }
        } else {
          userStats[participant.user._id].streak = 1;
          userStats[participant.user._id].lastSessionDate = sessionDate;
        }
      });
    });

    // Convert to array and sort by total hours
    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((stat, index) => ({
        ...stat,
        rank: index + 1,
        trophy: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 