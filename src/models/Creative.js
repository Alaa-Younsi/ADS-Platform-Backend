const mongoose = require('mongoose');

const creativeSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Creative name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'carousel', 'text'],
      required: true,
    },
    mediaUrl: {
      type: String,
      required: function () {
        return this.type !== 'text';
      },
    },
    thumbnailUrl: {
      type: String,
    },
    headline: {
      type: String,
      maxlength: [100, 'Headline cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    callToAction: {
      type: String,
      enum: ['learn_more', 'shop_now', 'sign_up', 'download', 'contact_us', 'apply_now'],
    },
    destinationUrl: {
      type: String,
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    fileSize: {
      type: Number, // in bytes
    },
    duration: {
      type: Number, // in seconds, for video
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'rejected'],
      default: 'draft',
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

// Index for efficient queries
creativeSchema.index({ campaign: 1, status: 1 });

module.exports = mongoose.model('Creative', creativeSchema);
