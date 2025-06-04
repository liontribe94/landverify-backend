const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const landController = require('../controllers/land.controller');
const { validateRequest } = require('../middleware/validate-request');
const { authenticate } = require('../middleware/auth');

// Validation for creating/updating land
const landValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('coordinates').isObject().withMessage('Coordinates must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Coordinates must include latitude and longitude');
      }
      return true;
    }),
  body('area').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Routes
router.get('/', landController.getAllLands);
router.get('/:id', landController.getLandById);
router.post('/', authenticate, landValidation, validateRequest, landController.createLand);
router.put('/:id', authenticate, landValidation, validateRequest, landController.updateLand);
router.delete('/:id', authenticate, landController.deleteLand);

module.exports = router; 