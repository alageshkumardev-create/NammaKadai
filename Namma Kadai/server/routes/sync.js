const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { syncToSheets } = require('../utils/sheets');
const Customer = require('../models/Customer');
const ServiceRecord = require('../models/ServiceRecord');

// @route   POST /api/sync/manual
// @desc    Manually trigger Google Sheets sync
// @access  Private
router.post('/manual', protect, async (req, res) => {
  try {
    const { type, id } = req.body;

    if (type === 'customer') {
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      await syncToSheets('customer', customer);
    } else if (type === 'service') {
      const record = await ServiceRecord.findById(id).populate('customerId');
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Service record not found'
        });
      }
      await syncToSheets('service', { customer: record.customerId, record });
    }

    res.json({
      success: true,
      message: 'Sync completed successfully'
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing to Google Sheets',
      error: error.message
    });
  }
});

module.exports = router;
