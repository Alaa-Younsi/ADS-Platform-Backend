const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Campaign name cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'draft',
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    targetAudience: {
      ageRange: {
        min: Number,
        max: Number,
      },
      locations: [String],
      interests: [String],
    },
    isArchived: {
      type: Boolean,
      default: false,
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

// Virtual for remaining budget
campaignSchema.virtual('remainingBudget').get(function () {
  return this.budget - this.spent;
});

// Virtual for budget utilization percentage
campaignSchema.virtual('budgetUtilization').get(function () {
  return this.budget > 0 ? (this.spent / this.budget) * 100 : 0;
});

// Virtual for campaign duration in days
campaignSchema.virtual('duration').get(function () {
  const diff = this.endDate - this.startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
campaignSchema.index({ owner: 1, status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
