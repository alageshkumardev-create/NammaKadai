const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find()
      .populate('customerId', 'name phone')
      .populate('serviceRecordId', 'nextServiceDate')
      .sort({ sentAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Notification.countDocuments();

    res.json({
      success: true,
      data: notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/trigger
// @desc    Manually trigger notification check (Development only)
// @access  Private
router.get('/trigger', async (req, res) => {
  try {
    console.log('🔔 Manual notification trigger initiated...');

    const { checkDueServices } = require('../utils/scheduler');
    const result = await checkDueServices();

    res.json({
      success: true,
      message: 'Notification check completed',
      ...result
    });
  } catch (error) {
    console.error('Manual notification trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering notifications',
      error: error.message
    });
  }
});

module.exports = router;
