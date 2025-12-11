const express = require('express');
const router = express.Router();
const { checkDueServices } = require('../utils/scheduler');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/test/trigger-notifications
// @desc    Manually trigger notification check (Development only)
// @access  Private
router.get('/trigger-notifications', async (req, res) => {
  try {
    console.log('🔔 Manual notification trigger initiated...');

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
