// ========================================
// SIGNUP ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
  createSignup,
  getSignupsByVolunteer,
  getSignupsByOpportunity,
  updateSignup,
  cancelSignup
} = require('../controllers/signup.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Create signup
router.post('/', createSignup);

// Get signups
router.get('/volunteer/:volunteerId', getSignupsByVolunteer);
router.get('/opportunity/:opportunityId', authorize('org_admin', 'super_admin'), getSignupsByOpportunity);

// Update/cancel signup
router.put('/:id', updateSignup);
router.delete('/:id', cancelSignup);

module.exports = router;
