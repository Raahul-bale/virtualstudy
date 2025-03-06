const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const studySessionController = require('../controllers/studySessionController');

// Validation middleware
const sessionValidation = [
  body('groupId').isMongoId().withMessage('Invalid group ID'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time')
];

const noteValidation = [
  body('content').trim().notEmpty().withMessage('Note content is required')
];

const flashcardValidation = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required')
];

// Routes
router.post('/', auth, sessionValidation, studySessionController.createSession);
router.get('/:id', auth, studySessionController.getSessionById);
router.post('/:id/join', auth, studySessionController.joinSession);
router.post('/:id/leave', auth, studySessionController.leaveSession);
router.post('/:id/notes', auth, noteValidation, studySessionController.addNote);
router.post('/:id/flashcards', auth, flashcardValidation, studySessionController.addFlashcard);
router.put('/:id/whiteboard', auth, studySessionController.updateWhiteboard);

module.exports = router; 