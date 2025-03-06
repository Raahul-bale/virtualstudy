const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', auth, leaderboardController.getLeaderboard);
router.get('/stats', auth, leaderboardController.getUserStats);

module.exports = router; 