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
      .populate('customerId', 'name phone model');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
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
    const record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

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
    const record = await ServiceRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
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
// @desc    Get upcoming service records
// @access  Private
router.get('/upcoming/all', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const records = await ServiceRecord.find({
      nextServiceDate: { $gte: today, $lte: futureDate }
    })
      .populate('customerId', 'name phone model address')
      .sort({ nextServiceDate: 1 });

    res.json({
      success: true,
      data: records,
      count: records.length
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
