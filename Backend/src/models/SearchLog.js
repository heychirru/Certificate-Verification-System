const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      trim: true,
    },
    found: {
      type: Boolean,
      required: true,
    },
    ip: {
      type: String,
      required: false, // Can be anonymized
    },
    userAgent: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use explicit timestamp field above
  }
);

// Index for efficient queries: timestamp and found status
searchLogSchema.index({ timestamp: -1, found: 1 });

const SearchLog = mongoose.model('SearchLog', searchLogSchema);

module.exports = SearchLog;
