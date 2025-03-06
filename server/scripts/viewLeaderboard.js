const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const viewLeaderboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all leaderboard entries with user information
    const leaderboards = await Leaderboard.find()
      .populate('user', 'username avatar')
      .sort({ totalHours: -1 });

    console.log('\nLeaderboard Rankings:');
    console.log('=====================');
    
    leaderboards.forEach((entry, index) => {
      const trophy = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${trophy} ${entry.user.username}:`);
      console.log(`   Total Hours: ${entry.totalHours.toFixed(1)}`);
      console.log(`   Total Sessions: ${entry.totalSessions}`);
      console.log(`   Current Streak: ${entry.currentStreak} days`);
      console.log(`   Longest Streak: ${entry.longestStreak} days`);
      console.log(`   Weekly Hours: ${entry.weeklyHours.toFixed(1)}`);
      console.log(`   Monthly Hours: ${entry.monthlyHours.toFixed(1)}`);
      console.log(`   Achievements: ${entry.achievements.join(', ')}`);
      console.log('---------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error viewing leaderboard:', error);
    process.exit(1);
  }
};

// Run the script
viewLeaderboard(); 