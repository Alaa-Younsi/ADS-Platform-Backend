const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    creative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creative',
    },
    eventType: {
      type: String,
      enum: ['impression', 'click', 'conversion', 'view'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
      },
      browser: String,
      os: String,
      location: {
        country: String,
        city: String,
      },
      referrer: String,
      ipAddress: String,
    },
    value: {
      type: Number, // For conversion tracking
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for efficient time-series queries
analyticsEventSchema.index({ campaign: 1, timestamp: -1 });
analyticsEventSchema.index({ campaign: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ creative: 1, eventType: 1 });

// Static method to aggregate analytics
analyticsEventSchema.statics.getAggregatedStats = async function (campaignId, startDate, endDate) {
  const match = {
    campaign: mongoose.Types.ObjectId(campaignId),
  };

  if (startDate && endDate) {
    match.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
      },
    },
  ]);

  // Format results
  const result = {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    views: 0,
    ctr: 0,
    conversionRate: 0,
    totalValue: 0,
  };

  stats.forEach((stat) => {
    const type = stat._id;
    result[type + 's'] = stat.count;
    if (type === 'conversion') {
      result.totalValue = stat.totalValue;
    }
  });

  // Calculate CTR
  if (result.impressions > 0) {
    result.ctr = ((result.clicks / result.impressions) * 100).toFixed(2);
  }

  // Calculate conversion rate
  if (result.clicks > 0) {
    result.conversionRate = ((result.conversions / result.clicks) * 100).toFixed(2);
  }

  return result;
};

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
