const express = require('express');
const { body } = require('express-validator');
const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createCreative,
  getCampaignStats,
} = require('../controllers/campaignController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// Validation rules
const campaignValidation = [
  body('name').notEmpty().trim().withMessage('Campaign name is required'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'completed'])
    .withMessage('Invalid status'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('startDate').isISO8601().toDate().withMessage('Invalid start date'),
  body('endDate').isISO8601().toDate().withMessage('Invalid end date'),
];

const creativeValidation = [
  body('name').notEmpty().trim().withMessage('Creative name is required'),
  body('type')
    .isIn(['image', 'video', 'carousel', 'text'])
    .withMessage('Invalid creative type'),
  body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
];

// Routes
router.get('/', authenticate, getAllCampaigns);
router.get('/stats', authenticate, getCampaignStats);
router.get('/:id', authenticate, getCampaignById);
router.post('/', authenticate, campaignValidation, validate, createCampaign);
router.put('/:id', authenticate, campaignValidation, validate, updateCampaign);
router.delete('/:id', authenticate, deleteCampaign);

// Creative routes
router.post('/:id/creatives', authenticate, creativeValidation, validate, createCreative);

module.exports = router;
