const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Customer = require('../models/Customer');
const ServiceRecord = require('../models/ServiceRecord');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/technicians
// @desc    Get all technicians (Admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view technicians'
      });
    }

    const technicians = await User.find({ role: 'technician' }).select('-password');

    res.json({
      success: true,
      data: technicians
    });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
});

// @route   PUT /api/technicians/profile
// @desc    Update own profile (Technician)
// @access  Private
router.put('/profile', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password; // Will be hashed by pre-save hook if we use save()

    // We use findById then save() to trigger the pre-save hook for password hashing
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   PUT /api/technicians/:id
// @desc    Update technician (Admin only)
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update technicians'
      });
    }

    const { name, email, phone, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin account'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating technician',
      error: error.message
    });
  }
});

// @route   DELETE /api/technicians/:id
// @desc    Delete technician (Admin only)
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete technicians'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin account'
      });
    }

    // Optional: Decide what to do with their customers. 
    // For now, we'll keep them but maybe unassign them or just leave them linked to the deleted ID.
    // Better approach: Prevent delete if they have customers, or reassign them.
    // Let's just delete the user for now as per simple requirements.

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Technician deleted'
    });
  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting technician',
      error: error.message
    });
  }
});

module.exports = router;
