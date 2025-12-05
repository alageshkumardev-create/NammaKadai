const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  serviceRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRecord',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  channel: {
    type: String,
    enum: ['sms', 'email', 'both'],
    required: true
  },
  to: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  error: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
