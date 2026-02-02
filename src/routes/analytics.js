const express = require('express');
const {
  getCampaignAnalytics,
  getAnalyticsOverview,
  createAnalyticsEvent,
  generateSimulatedData,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/overview', authenticate, getAnalyticsOverview);
router.get('/campaigns/:id', authenticate, getCampaignAnalytics);
router.post('/events', authenticate, createAnalyticsEvent);
router.post('/campaigns/:id/simulate', authenticate, generateSimulatedData);

module.exports = router;
