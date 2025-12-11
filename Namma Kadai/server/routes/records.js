const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ServiceRecord = require('../models/ServiceRecord');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/records/:id
// @desc    Get single service record
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('customerId', 'name phone model technicianId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && record.customerId.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service record',
      error: error.message
    });
  }
});

// @route   PUT /api/records/:id
// @desc    Update service record
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let record = await ServiceRecord.findById(req.params.id)
      .populate('customerId', 'technicianId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && record.customerId.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service record',
      error: error.message
    });
  }
});

// @route   DELETE /api/records/:id
// @desc    Delete service record
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('customerId', 'technicianId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && record.customerId.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Service record deleted'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service record',
      error: error.message
    });
  }
});

// @route   GET /api/records/upcoming
// @desc    Get upcoming service records with pagination
// @access  Private
router.get('/upcoming/all', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      nextServiceDate: { $gte: today }
    };

    // If not admin, filter by technician's customers
    if (req.user.role !== 'admin') {
      const Customer = require('../models/Customer');
      const myCustomers = await Customer.find({ technicianId: req.user.id }).select('_id');
      const customerIds = myCustomers.map(c => c._id);
      query.customerId = { $in: customerIds };
    }

    const count = await ServiceRecord.countDocuments(query);

    const records = await ServiceRecord.find(query)
      .populate('customerId', 'name phone model address')
      .sort({ nextServiceDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      success: true,
      data: records,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get upcoming records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming records',
      error: error.message
    });
  }
});

module.exports = router;
