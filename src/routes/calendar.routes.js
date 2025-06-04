const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required'),
  body('event_type').isIn(['meeting', 'viewing', 'inspection', 'follow_up', 'other']).withMessage('Invalid event type'),
  body('attendees').isArray().withMessage('Attendees must be an array')
];

// Routes
router.get('/', authenticate, calendarController.getAllEvents);
router.get('/:id', authenticate, calendarController.getEventById);
router.post('/', authenticate, eventValidation, validateRequest, calendarController.createEvent);
router.put('/:id', authenticate, eventValidation, validateRequest, calendarController.updateEvent);
router.delete('/:id', authenticate, calendarController.deleteEvent);
router.put('/:id/status', authenticate,
  body('status').isIn(['scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  validateRequest,
  calendarController.updateEventStatus
);

module.exports = router; 