const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate-request');

// Validation middleware
const propertyValidation = [
  body('owner_name').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
];

const documentValidation = [
  body('document_type').trim().notEmpty().withMessage('Document type is required'),
  body('document_name').trim().notEmpty().withMessage('Document name is required'),
  body('document_url').trim().notEmpty().withMessage('Document URL is required')
];

const verificationValidation = [
  body('document_index').isNumeric().withMessage('Document index is required'),
  body('verification_status').isIn(['verified', 'rejected', 'flagged']).withMessage('Invalid verification status'),
  body('notes').optional().trim().isString().withMessage('Notes must be a string')
];

// Property verification routes
router.post('/verify', authenticate, 
  body('title_number').optional().trim(),
  body('survey_plan_number').optional().trim(),
  body('coordinates.lat').optional().isFloat(),
  body('coordinates.lng').optional().isFloat(),
  validateRequest,
  propertyController.verifyPropertyByDetails
);

// Document management routes
router.post('/:id/documents', authenticate, documentValidation, validateRequest, propertyController.uploadDocument);
router.put('/:id/documents/verify', authenticate, verificationValidation, validateRequest, propertyController.verifyDocument);

// Standard CRUD routes
router.get('/', authenticate, propertyController.getAllProperties);
router.get('/:id', authenticate, propertyController.getPropertyById);
router.post('/', authenticate, propertyValidation, validateRequest, propertyController.createProperty);
router.put('/:id', authenticate, propertyValidation, validateRequest, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);
router.put('/:id/verification', authenticate, propertyController.updateVerificationStatus);

module.exports = router; 