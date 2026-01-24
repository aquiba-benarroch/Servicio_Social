// ========================================
// ORGANIZATION CONTROLLER
// ========================================

const Organization = require('../models/Organization.model');

// @route   GET /api/organizations
// @desc    Get all organizations
// @access  Public
exports.getAllOrganizations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    // Only show approved organizations to non-admins
    if (req.user?.role !== 'super_admin') {
      filter.status = 'approved';
    } else if (status) {
      filter.status = status;
    }

    const organizations = await Organization.find(filter).populate('adminId', 'name email');
    
    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching organizations'
    });
  }
};

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Public
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate('adminId', 'name email');
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching organization'
    });
  }
};

// @route   POST /api/organizations
// @desc    Create new organization
// @access  Private
exports.createOrganization = async (req, res) => {
  try {
    const { name, description, category, contactEmail, contactPhone, address, website, logo } = req.body;

    // Validation
    if (!name || !category || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, category, and contact email'
      });
    }

    const organization = await Organization.create({
      name,
      description,
      category,
      contactEmail,
      contactPhone,
      address,
      website,
      logo,
      adminId: req.user._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating organization'
    });
  }
};

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (Admin of org or Super Admin)
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && organization.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this organization'
      });
    }

    const allowedUpdates = ['name', 'description', 'category', 'contactEmail', 'contactPhone', 'address', 'website', 'logo'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Super admin can update status
    if (req.user.role === 'super_admin' && req.body.status) {
      updates.status = req.body.status;
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedOrganization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating organization'
    });
  }
};

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
// @access  Private (Super Admin only)
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Organization deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting organization'
    });
  }
};
