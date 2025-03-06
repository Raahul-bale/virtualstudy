const Leaderboard = require('../models/Leaderboard');
const StudySession = require('../models/StudySession');

// Update user stats when they join a session
exports.updateUserStats = async (userId, sessionId) => {
  try {
    const session = await StudySession.findById(sessionId);
    if (!session) return;

    const participant = session.participants.find(
      p => p.user.toString() === userId.toString()
    );
    if (!participant) return;

    const hours = (participant.focusTime || 0) / 60;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let leaderboard = await Leaderboard.findOne({ user: userId });
    if (!leaderboard) {
      leaderboard = new Leaderboard({ user: userId });
    }

    // Update total stats
    leaderboard.totalHours += hours;
    leaderboard.totalSessions += 1;

    // Update streak
    if (leaderboard.lastSessionDate) {
      const lastDate = new Date(leaderboard.lastSessionDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        leaderboard.currentStreak += 1;
        if (leaderboard.currentStreak > leaderboard.longestStreak) {
          leaderboard.longestStreak = leaderboard.currentStreak;
        }
      } else if (diffDays > 1) {
        leaderboard.currentStreak = 1;
      }
    } else {
      leaderboard.currentStreak = 1;
      leaderboard.longestStreak = 1;
    }

    leaderboard.lastSessionDate = today;

    // Update weekly and monthly hours
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const recentSessions = await StudySession.find({
      'participants.user': userId,
      'participants.joinTime': { $gte: weekStart }
    });

    leaderboard.weeklyHours = recentSessions.reduce((total, session) => {
      const participant = session.participants.find(p => p.user.toString() === userId.toString());
      return total + (participant.focusTime || 0) / 60;
    }, 0);

    const monthlySessions = await StudySession.find({
      'participants.user': userId,
      'participants.joinTime': { $gte: monthStart }
    });

    leaderboard.monthlyHours = monthlySessions.reduce((total, session) => {
      const participant = session.participants.find(p => p.user.toString() === userId.toString());
      return total + (participant.focusTime || 0) / 60;
    }, 0);

    // Update history
    leaderboard.history.push({
      date: today,
      hours,
      sessions: 1
    });

    // Keep only last 30 days of history
    if (leaderboard.history.length > 30) {
      leaderboard.history.shift();
    }

    // Check and update achievements
    if (!leaderboard.achievements.includes('first_session')) {
      leaderboard.achievements.push('first_session');
    }
    if (leaderboard.currentStreak >= 7 && !leaderboard.achievements.includes('week_streak')) {
      leaderboard.achievements.push('week_streak');
    }
    if (leaderboard.currentStreak >= 30 && !leaderboard.achievements.includes('month_streak')) {
      leaderboard.achievements.push('month_streak');
    }
    if (leaderboard.totalHours >= 100 && !leaderboard.achievements.includes('study_master')) {
      leaderboard.achievements.push('study_master');
    }

    await leaderboard.save();
  } catch (error) {
    console.error('Error updating leaderboard stats:', error);
  }
};

// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('user', 'username avatar')
      .sort({ totalHours: -1 })
      .limit(100);

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      username: entry.user.username,
      avatar: entry.user.avatar,
      totalHours: entry.totalHours,
      totalSessions: entry.totalSessions,
      currentStreak: entry.currentStreak,
      longestStreak: entry.longestStreak,
      weeklyHours: entry.weeklyHours,
      monthlyHours: entry.monthlyHours,
      achievements: entry.achievements,
      rank: index + 1,
      trophy: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const stats = await Leaderboard.findOne({ user: req.user._id })
      .populate('user', 'username avatar');

    if (!stats) {
      return res.json({
        totalHours: 0,
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyHours: 0,
        monthlyHours: 0,
        achievements: [],
        history: []
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 