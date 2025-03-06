const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudySession = require('../models/StudySession');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const migrateLeaderboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all study sessions
    const sessions = await StudySession.find()
      .populate({
        path: 'participants.user',
        model: 'User',
        select: 'username avatar'
      })
      .sort({ 'participants.joinTime': 1 });

    console.log(`Found ${sessions.length} study sessions to process`);

    // Process each session
    for (const session of sessions) {
      for (const participant of session.participants) {
        if (!participant.user) continue;

        const userId = participant.user._id;
        const hours = (participant.focusTime || 0) / 60;
        const sessionDate = new Date(participant.joinTime);
        sessionDate.setHours(0, 0, 0, 0);

        // Find or create leaderboard entry
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
          const diffDays = Math.floor((sessionDate - lastDate) / (1000 * 60 * 60 * 24));
          
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

        leaderboard.lastSessionDate = sessionDate;

        // Update history
        const existingHistoryEntry = leaderboard.history.find(
          h => h.date.getTime() === sessionDate.getTime()
        );

        if (existingHistoryEntry) {
          existingHistoryEntry.hours += hours;
          existingHistoryEntry.sessions += 1;
        } else {
          leaderboard.history.push({
            date: sessionDate,
            hours,
            sessions: 1
          });
        }

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
        console.log(`Updated stats for user ${participant.user.username}`);
      }
    }

    // Calculate weekly and monthly hours for all users
    const leaderboards = await Leaderboard.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    for (const leaderboard of leaderboards) {
      // Calculate weekly hours
      leaderboard.weeklyHours = leaderboard.history
        .filter(h => h.date >= weekStart)
        .reduce((total, h) => total + h.hours, 0);

      // Calculate monthly hours
      leaderboard.monthlyHours = leaderboard.history
        .filter(h => h.date >= monthStart)
        .reduce((total, h) => total + h.hours, 0);

      await leaderboard.save();
      console.log(`Updated weekly/monthly hours for user ${leaderboard.user}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateLeaderboard(); 