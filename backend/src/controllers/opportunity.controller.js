// ========================================
// OPPORTUNITY CONTROLLER
// ========================================

const Opportunity = require('../models/Opportunity.model');

// @route   GET /api/opportunities
// @desc    Get all opportunities
// @access  Public
exports.getAllOpportunities = async (req, res) => {
  try {
    const { status, category, organizationId } = req.query;
    const filter = {};
    
    // Only show published opportunities to non-admins
    if (!req.user || req.user.role === 'volunteer') {
      filter.status = 'published';
      filter.remainingSlots = { $gt: 0 };
      filter.dateEnd = { $gte: new Date() };
    } else if (status) {
      filter.status = status;
    }
    
    if (category) filter.category = category;
    if (organizationId) filter.organizationId = organizationId;

    const opportunities = await Opportunity.find(filter)
      .populate('organizationId', 'name logo')
      .populate('createdBy', 'name')
      .sort({ dateStart: 1 });
    
    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching opportunities'
    });
  }
};

// @route   GET /api/opportunities/:id
// @desc    Get opportunity by ID
// @access  Public
exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('organizationId', 'name logo description contactEmail contactPhone')
      .populate('createdBy', 'name');
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching opportunity'
    });
  }
};

// @route   POST /api/opportunities
// @desc    Create new opportunity
// @access  Private (Org Admin or Super Admin)
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title, description, organizationId, category, location,
      dateStart, dateEnd, timeStart, timeEnd,
      totalSlots, requirements, skills, image
    } = req.body;

    // Validation
    if (!title || !description || !organizationId || !category || !location || !dateStart || !dateEnd || !totalSlots) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      organizationId,
      category,
      location,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd,
      totalSlots,
      remainingSlots: totalSlots,
      requirements,
      skills,
      image,
      createdBy: req.user._id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating opportunity'
    });
  }
};

// @route   PUT /api/opportunities/:id
// @desc    Update opportunity
// @access  Private (Creator or Super Admin)
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this opportunity'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'location',
      'dateStart', 'dateEnd', 'timeStart', 'timeEnd',
      'totalSlots', 'requirements', 'skills', 'image', 'status'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Adjust remaining slots if total slots changed
    if (updates.totalSlots) {
      const slotsUsed = opportunity.totalSlots - opportunity.remainingSlots;
      updates.remainingSlots = updates.totalSlots - slotsUsed;
      if (updates.remainingSlots < 0) updates.remainingSlots = 0;
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedOpportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating opportunity'
    });
  }
};

// @route   DELETE /api/opportunities/:id
// @desc    Delete opportunity
// @access  Private (Creator or Super Admin)
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this opportunity'
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {
        message: 'Opportunity deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting opportunity'
    });
  }
};
