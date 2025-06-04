const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('assigned_to').trim().notEmpty().withMessage('Assignee is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('due_date').optional().isISO8601().withMessage('Invalid date format')
];

// Routes
router.get('/', authenticate, taskController.getAllTasks);
router.get('/:id', authenticate, taskController.getTaskById);
router.post('/', authenticate, taskValidation, validateRequest, taskController.createTask);
router.put('/:id', authenticate, taskValidation, validateRequest, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);
router.put('/:id/status', authenticate, 
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  validateRequest,
  taskController.updateTaskStatus
);

module.exports = router; 