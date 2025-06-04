const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const dealValidation = [
  body('property_id').trim().notEmpty().withMessage('Property ID is required'),
  body('lead_id').trim().notEmpty().withMessage('Lead ID is required'),
  body('agent_id').trim().notEmpty().withMessage('Agent ID is required'),
  body('deal_type').isIn(['sale', 'rent', 'lease']).withMessage('Invalid deal type'),
  body('value').isNumeric().withMessage('Deal value must be a number'),
  body('commission').isNumeric().withMessage('Commission must be a number')
];

const documentValidation = [
  body('document_url').trim().notEmpty().withMessage('Document URL is required'),
  body('document_type').trim().notEmpty().withMessage('Document type is required')
];

// Routes
router.get('/', authenticate, dealController.getAllDeals);
router.get('/:id', authenticate, dealController.getDealById);
router.post('/', authenticate, dealValidation, validateRequest, dealController.createDeal);
router.put('/:id', authenticate, dealValidation, validateRequest, dealController.updateDeal);
router.delete('/:id', authenticate, dealController.deleteDeal);
router.post('/:id/documents', authenticate, documentValidation, validateRequest, dealController.addDocument);

module.exports = router; 