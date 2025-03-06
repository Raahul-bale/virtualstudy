import React from 'react';
import { motion } from 'framer-motion';

const studyTips = [
  {
    title: 'Set Clear Goals',
    description: 'Define what you want to achieve in each study session. Break down complex topics into manageable chunks.',
    icon: '🎯'
  },
  {
    title: 'Use the Pomodoro Technique',
    description: 'Study for 25 minutes, then take a 5-minute break. This helps maintain focus and prevent burnout.',
    icon: '⏰'
  },
  {
    title: 'Create a Study Schedule',
    description: 'Plan your study sessions in advance and stick to a consistent routine.',
    icon: '📅'
  },
  {
    title: 'Take Active Notes',
    description: 'Write down key points, create mind maps, and summarize information in your own words.',
    icon: '📝'
  },
  {
    title: 'Practice with Flashcards',
    description: 'Create and review flashcards to reinforce your learning and test your knowledge.',
    icon: '🎴'
  },
  {
    title: 'Join Study Groups',
    description: 'Collaborate with peers, share knowledge, and learn from different perspectives.',
    icon: '👥'
  }
];

const HowToStudy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Study Effectively
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover proven study techniques and strategies to maximize your learning potential.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studyTips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {tip.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join our virtual study groups and put these techniques into practice.
          </p>
          <button className="btn btn-primary">
            Find Your Study Group
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToStudy; 