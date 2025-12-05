const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  serviceDate: {
    type: Date,
    required: [true, 'Service date is required'],
    default: Date.now
  },
  technician: {
    type: String,
    trim: true
  },
  partsReplaced: [{
    type: String,
    trim: true
  }],
  priorityParts: [{
    part: {
      type: String,
      trim: true
    },
    care: {
      type: String,
      trim: true
    }
  }],
  nextServiceDate: {
    type: Date,
    required: [true, 'Next service date is required'],
    index: true
  },
  notes: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  notified: {
    type: Boolean,
    default: false,
    index: true
  },
  notifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
serviceRecordSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient notification queries
serviceRecordSchema.index({ nextServiceDate: 1, notified: 1 });

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
