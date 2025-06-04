const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('source').trim().notEmpty().withMessage('Lead source is required')
];

const communicationValidation = [
  body('type').trim().notEmpty().withMessage('Communication type is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Routes
router.get('/', authenticate, leadController.getAllLeads);
router.get('/:id', authenticate, leadController.getLeadById);
router.post('/', authenticate, leadValidation, validateRequest, leadController.createLead);
router.put('/:id', authenticate, leadValidation, validateRequest, leadController.updateLead);
router.delete('/:id', authenticate, leadController.deleteLead);
router.post('/:id/communication', authenticate, communicationValidation, validateRequest, leadController.addCommunication);
router.put('/:id/assign', authenticate, leadController.assignAgent);

module.exports = router; 