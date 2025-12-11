const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const ServiceRecord = require('../models/ServiceRecord');
const { protect } = require('../middleware/auth');
const { syncToSheets } = require('../utils/sheets');

// All routes are protected
router.use(protect);

// @route   GET /api/customers
// @desc    Get all customers with pagination and search
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search
      ? { $text: { $search: search } }
      : {};

    // If not admin, only show own customers
    if (req.user.role !== 'admin') {
      query.technicianId = req.user.id;
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && customer.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this customer'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('model').trim().notEmpty().withMessage('RO model is required'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add technicianId to body
    const customerData = {
      ...req.body,
      technicianId: req.user.id
    };

    const customer = await Customer.create(customerData);

    // Sync to Google Sheets (non-blocking)
    syncToSheets('customer', customer).catch(err =>
      console.error('Sheets sync error:', err)
    );

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && customer.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this customer'
      });
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && customer.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this customer'
      });
    }

    // Delete associated service records
    await ServiceRecord.deleteMany({ customerId: req.params.id });

    await customer.deleteOne();

    res.json({
      success: true,
      message: 'Customer and associated records deleted'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

// @route   GET /api/customers/:id/records
// @desc    Get service records for a customer
// @access  Private
router.get('/:id/records', async (req, res) => {
  try {
    // Check customer ownership first
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (req.user.role !== 'admin' && customer.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view records for this customer'
      });
    }

    const records = await ServiceRecord.find({ customerId: req.params.id })
      .sort({ serviceDate: -1 });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service records',
      error: error.message
    });
  }
});

// @route   POST /api/customers/:id/records
// @desc    Create service record for a customer
// @access  Private
router.post('/:id/records', [
  body('nextServiceDate').notEmpty().withMessage('Next service date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify customer exists and ownership
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (req.user.role !== 'admin' && customer.technicianId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add records for this customer'
      });
    }

    const record = await ServiceRecord.create({
      ...req.body,
      customerId: req.params.id
    });

    // Sync to Google Sheets (non-blocking)
    syncToSheets('service', { customer, record }).catch(err =>
      console.error('Sheets sync error:', err)
    );

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service record',
      error: error.message
    });
  }
});

module.exports = router;
