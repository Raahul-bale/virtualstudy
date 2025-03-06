const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');

// Validation middleware
const resourceValidation = [
  body('groupId').isMongoId().withMessage('Invalid group ID'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['PDF', 'Video', 'Note', 'Flashcard']).withMessage('Invalid resource type'),
  body('url').isURL().withMessage('Invalid URL')
];

// Routes
router.post('/', auth, resourceValidation, resourceController.addResource);
router.get('/:groupId', auth, resourceController.getGroupResources);
router.delete('/:groupId/:resourceId', auth, resourceController.deleteResource);
router.put('/:groupId/:resourceId', auth, resourceValidation, resourceController.updateResource);

module.exports = router; 