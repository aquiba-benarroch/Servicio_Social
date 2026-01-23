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
const { apiLimiter, writeLimiter } = require('../middleware/rate-limit.middleware');

// All routes require authentication
router.use(authMiddleware);

// Create signup
router.post('/', writeLimiter, createSignup);

// Get signups
router.get('/volunteer/:volunteerId', apiLimiter, getSignupsByVolunteer);
router.get('/opportunity/:opportunityId', apiLimiter, authorize('org_admin', 'super_admin'), getSignupsByOpportunity);

// Update/cancel signup
router.put('/:id', writeLimiter, updateSignup);
router.delete('/:id', writeLimiter, cancelSignup);

module.exports = router;
