const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, isModerator } = require('../middleware/auth');
const groupController = require('../controllers/groupController');

// Validation middleware
const groupValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('subject').isIn(['Web Development', 'Data Structures', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Competitive Exams'])
    .withMessage('Invalid subject'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('schedule').isArray().withMessage('Schedule must be an array')
];

// Routes
router.post('/', auth, groupValidation, groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/:id', auth, groupController.getGroupById);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);
router.post('/:id/moderators', auth, isModerator, groupController.addModerator);

module.exports = router; 