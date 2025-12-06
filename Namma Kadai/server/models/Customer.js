const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    required: [true, 'RO model is required'],
    trim: true
  },
  installedOn: {
    type: Date,
    default: Date.now
  },
  images: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
customerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
customerSchema.index({ name: 'text', phone: 'text', model: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
