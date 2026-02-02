const Campaign = require('../models/Campaign');
const Creative = require('../models/Creative');

/**
 * Get all campaigns
 */
const getAllCampaigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};

    // Non-admin users can only see their own campaigns
    if (req.user.role !== 'admin') {
      query.owner = req.user.userId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Don't show archived campaigns by default
    query.isArchived = false;

    const campaigns = await Campaign.find(query)
      .populate('owner', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Campaign.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign by ID
 */
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('owner', 'firstName lastName email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && campaign.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get creatives for this campaign
    const creatives = await Creative.find({ campaign: campaign._id });

    res.status(200).json({
      success: true,
      data: {
        campaign,
        creatives,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new campaign
 */
const createCampaign = async (req, res, next) => {
  try {
    const campaignData = {
      ...req.body,
      owner: req.user.userId,
    };

    const campaign = await Campaign.create(campaignData);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update campaign
 */
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && campaign.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update campaign
    Object.assign(campaign, req.body);
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: { campaign },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete campaign
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && campaign.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create creative for campaign
 */
const createCreative = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && campaign.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const creative = await Creative.create({
      ...req.body,
      campaign: campaignId,
    });

    res.status(201).json({
      success: true,
      message: 'Creative created successfully',
      data: { creative },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign statistics
 */
const getCampaignStats = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.userId;
    
    const query = userId ? { owner: userId } : {};

    const stats = await Campaign.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$spent' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalBudget: 0,
        totalSpent: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createCreative,
  getCampaignStats,
};
