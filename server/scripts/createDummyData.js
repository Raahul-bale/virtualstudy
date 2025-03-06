const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const StudyGroup = require('../models/StudyGroup');
const StudySession = require('../models/StudySession');
const Leaderboard = require('../models/Leaderboard');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const createDummyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      StudyGroup.deleteMany({}),
      StudySession.deleteMany({}),
      Leaderboard.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create dummy users with more realistic usernames
    const dummyUsers = [
      { username: 'study_master', email: 'master@example.com', password: 'password123' },
      { username: 'code_ninja', email: 'ninja@example.com', password: 'password123' },
      { username: 'math_wizard', email: 'wizard@example.com', password: 'password123' },
      { username: 'physics_pro', email: 'physics@example.com', password: 'password123' },
      { username: 'data_geek', email: 'geek@example.com', password: 'password123' }
    ];

    const createdUsers = [];
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create multiple study groups
    const groups = await Promise.all([
      new StudyGroup({
        name: 'Advanced Programming',
        subject: 'Web Development',
        description: 'Study group for advanced programming concepts',
        creator: createdUsers[0]._id,
        members: createdUsers.map(user => user._id),
        moderators: [createdUsers[0]._id]
      }).save(),
      new StudyGroup({
        name: 'Mathematics Club',
        subject: 'Mathematics',
        description: 'Advanced mathematics study group',
        creator: createdUsers[1]._id,
        members: createdUsers.map(user => user._id),
        moderators: [createdUsers[1]._id]
      }).save()
    ]);
    console.log('Created study groups');

    // Create study sessions with more varied patterns
    const subjects = ['Web Development', 'Data Structures', 'Physics', 'Mathematics', 'Algorithms'];
    const sessionDurations = [60, 90, 120, 180, 240, 300]; // in minutes

    // Create more sessions (40 instead of 20) with varied patterns
    for (let i = 0; i < 40; i++) {
      const randomUsers = [...createdUsers]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 random users per session

      const startTime = new Date();
      startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
      startTime.setHours(Math.floor(Math.random() * 12) + 8); // Random hour between 8 AM and 8 PM

      const duration = sessionDurations[Math.floor(Math.random() * sessionDurations.length)];
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const session = new StudySession({
        group: groups[Math.floor(Math.random() * groups.length)]._id,
        title: `${subjects[Math.floor(Math.random() * subjects.length)]} Study Session`,
        description: 'Group study session',
        startTime,
        endTime,
        participants: randomUsers.map(user => ({
          user: user._id,
          joinTime: startTime,
          leaveTime: endTime,
          focusTime: duration
        })),
        status: 'completed'
      });

      await session.save();
      console.log(`Created study session ${i + 1}/40 with ${randomUsers.length} participants`);
    }

    console.log('Dummy data creation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy data:', error);
    process.exit(1);
  }
};

// Run the script
createDummyData(); 