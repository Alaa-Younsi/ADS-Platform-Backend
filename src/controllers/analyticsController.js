const AnalyticsEvent = require('../models/AnalyticsEvent');
const Campaign = require('../models/Campaign');

/**
 * Get analytics for a specific campaign
 */
const getCampaignAnalytics = async (req, res, next) => {
  try {
    const { id: campaignId } = req.params;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Verify campaign exists and user has access
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

    // Get aggregated stats
    const stats = await AnalyticsEvent.getAggregatedStats(
      campaignId,
      startDate,
      endDate
    );

    // Get time-series data
    const timeSeriesData = await getTimeSeriesData(
      campaignId,
      startDate,
      endDate,
      groupBy
    );

    // Get device breakdown
    const deviceBreakdown = await getDeviceBreakdown(campaignId, startDate, endDate);

    // Get location breakdown
    const locationBreakdown = await getLocationBreakdown(campaignId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        summary: stats,
        timeSeries: timeSeriesData,
        deviceBreakdown,
        locationBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overall analytics overview
 */
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};

    // Non-admin users: filter by their campaigns
    if (req.user.role !== 'admin') {
      const userCampaigns = await Campaign.find({ owner: req.user.userId }).select('_id');
      matchQuery.campaign = { $in: userCampaigns.map((c) => c._id) };
    }

    // Date filter
    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Aggregate analytics across all campaigns
    const overview = await AnalyticsEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    // Format results
    const stats = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      views: 0,
      ctr: 0,
      conversionRate: 0,
      totalValue: 0,
    };

    overview.forEach((item) => {
      const type = item._id;
      stats[type + 's'] = item.count;
      if (type === 'conversion') {
        stats.totalValue = item.totalValue;
      }
    });

    // Calculate rates
    if (stats.impressions > 0) {
      stats.ctr = ((stats.clicks / stats.impressions) * 100).toFixed(2);
    }

    if (stats.clicks > 0) {
      stats.conversionRate = ((stats.conversions / stats.clicks) * 100).toFixed(2);
    }

    // Get top performing campaigns
    const topCampaigns = await getTopCampaigns(req.user);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        topCampaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create analytics event (for testing/simulation)
 */
const createAnalyticsEvent = async (req, res, next) => {
  try {
    const event = await AnalyticsEvent.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Analytics event created',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate simulated analytics data for a campaign
 */
const generateSimulatedData = async (req, res, next) => {
  try {
    const { id: campaignId } = req.params;
    const { days = 7 } = req.body;

    // Verify campaign exists and user has access
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

    const events = [];
    const deviceTypes = ['desktop', 'mobile', 'tablet'];
    const countries = ['USA', 'UK', 'Canada', 'Germany', 'France'];
    const cities = ['New York', 'London', 'Toronto', 'Berlin', 'Paris'];

    // Generate events for the specified number of days
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // Generate impressions
      const impressions = Math.floor(Math.random() * 1000) + 500;
      for (let i = 0; i < impressions; i++) {
        events.push({
          campaign: campaignId,
          eventType: 'impression',
          timestamp: new Date(date.getTime() + Math.random() * 86400000),
          metadata: {
            deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            location: {
              country: countries[Math.floor(Math.random() * countries.length)],
              city: cities[Math.floor(Math.random() * cities.length)],
            },
          },
        });
      }

      // Generate clicks (2-5% CTR)
      const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.03));
      for (let i = 0; i < clicks; i++) {
        events.push({
          campaign: campaignId,
          eventType: 'click',
          timestamp: new Date(date.getTime() + Math.random() * 86400000),
          metadata: {
            deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            location: {
              country: countries[Math.floor(Math.random() * countries.length)],
              city: cities[Math.floor(Math.random() * cities.length)],
            },
          },
        });
      }

      // Generate conversions (5-10% of clicks)
      const conversions = Math.floor(clicks * (0.05 + Math.random() * 0.05));
      for (let i = 0; i < conversions; i++) {
        events.push({
          campaign: campaignId,
          eventType: 'conversion',
          timestamp: new Date(date.getTime() + Math.random() * 86400000),
          value: Math.floor(Math.random() * 100) + 20,
          metadata: {
            deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            location: {
              country: countries[Math.floor(Math.random() * countries.length)],
              city: cities[Math.floor(Math.random() * cities.length)],
            },
          },
        });
      }
    }

    // Insert all events
    await AnalyticsEvent.insertMany(events);

    res.status(201).json({
      success: true,
      message: `Generated ${events.length} simulated analytics events`,
      data: {
        eventsCreated: events.length,
        days,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions

async function getTimeSeriesData(campaignId, startDate, endDate, groupBy) {
  const matchQuery = { campaign: campaignId };

  if (startDate && endDate) {
    matchQuery.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = { $dateToString: { format: '%Y-%m-%d-%H', date: '$timestamp' } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
      break;
    case 'week':
      dateFormat = { $dateToString: { format: '%Y-W%V', date: '$timestamp' } };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
      break;
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
  }

  const timeSeries = await AnalyticsEvent.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          date: dateFormat,
          eventType: '$eventType',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Format results
  const formatted = {};
  timeSeries.forEach((item) => {
    const date = item._id.date;
    if (!formatted[date]) {
      formatted[date] = { date, impressions: 0, clicks: 0, conversions: 0 };
    }
    formatted[date][item._id.eventType + 's'] = item.count;
  });

  return Object.values(formatted);
}

async function getDeviceBreakdown(campaignId, startDate, endDate) {
  const matchQuery = { campaign: campaignId };

  if (startDate && endDate) {
    matchQuery.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return await AnalyticsEvent.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$metadata.deviceType',
        impressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
        },
        conversions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] },
        },
      },
    },
  ]);
}

async function getLocationBreakdown(campaignId, startDate, endDate) {
  const matchQuery = { campaign: campaignId };

  if (startDate && endDate) {
    matchQuery.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return await AnalyticsEvent.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$metadata.location.country',
        impressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
        },
        conversions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] },
        },
      },
    },
    { $sort: { impressions: -1 } },
    { $limit: 10 },
  ]);
}

async function getTopCampaigns(user) {
  const matchQuery = {};

  if (user.role !== 'admin') {
    const userCampaigns = await Campaign.find({ owner: user.userId }).select('_id');
    matchQuery.campaign = { $in: userCampaigns.map((c) => c._id) };
  }

  const topCampaigns = await AnalyticsEvent.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$campaign',
        impressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
        },
        conversions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] },
        },
      },
    },
    { $sort: { impressions: -1 } },
    { $limit: 5 },
  ]);

  // Populate campaign details
  for (const item of topCampaigns) {
    const campaign = await Campaign.findById(item._id).select('name status');
    item.campaign = campaign;
  }

  return topCampaigns;
}

module.exports = {
  getCampaignAnalytics,
  getAnalyticsOverview,
  createAnalyticsEvent,
  generateSimulatedData,
};
