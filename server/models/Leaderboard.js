const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastSessionDate: {
    type: Date
  },
  weeklyHours: {
    type: Number,
    default: 0
  },
  monthlyHours: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String,
    enum: ['first_session', 'week_streak', 'month_streak', 'study_master', 'early_bird', 'night_owl']
  }],
  history: [{
    date: Date,
    hours: Number,
    sessions: Number
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
leaderboardSchema.index({ totalHours: -1 });
leaderboardSchema.index({ currentStreak: -1 });
leaderboardSchema.index({ weeklyHours: -1 });
leaderboardSchema.index({ monthlyHours: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema); 