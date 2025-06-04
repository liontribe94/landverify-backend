const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const agentValidation = [
  body('user_id').trim().notEmpty().withMessage('User ID is required'),
  body('license_number').trim().notEmpty().withMessage('License number is required'),
  body('specializations').isArray().withMessage('Specializations must be an array'),
  body('areas_served').isArray().withMessage('Areas served must be an array')
];

// Routes
router.get('/', authenticate, agentController.getAllAgents);
router.get('/:id', authenticate, agentController.getAgentById);
router.post('/', authenticate, agentValidation, validateRequest, agentController.createAgent);
router.put('/:id', authenticate, agentValidation, validateRequest, agentController.updateAgent);
router.delete('/:id', authenticate, agentController.deleteAgent);
router.put('/:id/performance', authenticate, agentController.updatePerformanceMetrics);

module.exports = router; 