// ========================================
// SIGNUP CONTROLLER
// ========================================

const Signup = require('../models/Signup.model');
const Opportunity = require('../models/Opportunity.model');

// @route   POST /api/signups
// @desc    Create new signup (volunteer signs up for opportunity)
// @access  Private (Volunteer)
exports.createSignup = async (req, res) => {
  try {
    const { opportunityId, notes } = req.body;
    const volunteerId = req.user._id;

    // Validation
    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide opportunity ID'
      });
    }

    // Check if opportunity exists and is available
    const opportunity = await Opportunity.findById(opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    if (opportunity.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'This opportunity is not available for signup'
      });
    }

    if (opportunity.remainingSlots <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No slots remaining for this opportunity'
      });
    }

    // Check if user already signed up
    const existingSignup = await Signup.findOne({
      opportunityId,
      volunteerId,
      status: { $ne: 'cancelled' }
    });

    if (existingSignup) {
      return res.status(400).json({
        success: false,
        error: 'You have already signed up for this opportunity'
      });
    }

    // Create signup
    const signup = await Signup.create({
      opportunityId,
      volunteerId,
      notes,
      status: 'confirmed'
    });

    // Update opportunity remaining slots
    opportunity.remainingSlots -= 1;
    if (opportunity.remainingSlots === 0) {
      opportunity.status = 'closed';
    }
    await opportunity.save();

    res.status(201).json({
      success: true,
      data: signup
    });
  } catch (error) {
    console.error('Create signup error:', error);
    
    // Handle duplicate signup error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already signed up for this opportunity'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error creating signup'
    });
  }
};

// @route   GET /api/signups/volunteer/:volunteerId
// @desc    Get signups by volunteer
// @access  Private
exports.getSignupsByVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Only allow users to see their own signups unless admin
    if (req.user.role === 'volunteer' && req.user._id.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these signups'
      });
    }

    const signups = await Signup.find({ volunteerId })
      .populate({
        path: 'opportunityId',
        populate: { path: 'organizationId', select: 'name logo' }
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: signups
    });
  } catch (error) {
    console.error('Get volunteer signups error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching signups'
    });
  }
};

// @route   GET /api/signups/opportunity/:opportunityId
// @desc    Get signups by opportunity
// @access  Private (Org Admin or Super Admin)
exports.getSignupsByOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const signups = await Signup.find({ opportunityId })
      .populate('volunteerId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: signups
    });
  } catch (error) {
    console.error('Get opportunity signups error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching signups'
    });
  }
};

// @route   PUT /api/signups/:id
// @desc    Update signup
// @access  Private
exports.updateSignup = async (req, res) => {
  try {
    const signup = await Signup.findById(req.params.id);

    if (!signup) {
      return res.status(404).json({
        success: false,
        error: 'Signup not found'
      });
    }

    // Check authorization
    const isVolunteer = req.user._id.toString() === signup.volunteerId.toString();
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'org_admin';
    
    if (!isVolunteer && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this signup'
      });
    }

    const allowedUpdates = ['status', 'notes', 'rating', 'feedback', 'hoursCompleted'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedSignup = await Signup.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSignup
    });
  } catch (error) {
    console.error('Update signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating signup'
    });
  }
};

// @route   DELETE /api/signups/:id
// @desc    Cancel signup
// @access  Private
exports.cancelSignup = async (req, res) => {
  try {
    const signup = await Signup.findById(req.params.id);

    if (!signup) {
      return res.status(404).json({
        success: false,
        error: 'Signup not found'
      });
    }

    // Check authorization (only volunteer can cancel their own signup)
    if (req.user._id.toString() !== signup.volunteerId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this signup'
      });
    }

    // Update signup status to cancelled
    signup.status = 'cancelled';
    await signup.save();

    // Update opportunity remaining slots
    const opportunity = await Opportunity.findById(signup.opportunityId);
    if (opportunity) {
      opportunity.remainingSlots += 1;
      if (opportunity.status === 'closed' && opportunity.remainingSlots > 0) {
        opportunity.status = 'published';
      }
      await opportunity.save();
    }

    res.json({
      success: true,
      data: {
        message: 'Signup cancelled successfully'
      }
    });
  } catch (error) {
    console.error('Cancel signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelling signup'
    });
  }
};
