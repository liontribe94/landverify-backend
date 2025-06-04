const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

// Routes
router.get('/overview', authenticate, dashboardController.getOverviewStats);
router.get('/agents/:id/performance', authenticate, dashboardController.getAgentPerformance);
router.get('/leads/analytics', authenticate, dashboardController.getLeadAnalytics);
router.get('/properties/analytics', authenticate, dashboardController.getPropertyAnalytics);

module.exports = router; 