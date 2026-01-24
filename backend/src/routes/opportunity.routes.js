// ========================================
// OPPORTUNITY ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunity.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const { apiLimiter, writeLimiter } = require('../middleware/rate-limit.middleware');

// Public routes
router.get('/', apiLimiter, getAllOpportunities);
router.get('/:id', apiLimiter, getOpportunityById);

// Protected routes
router.post('/', writeLimiter, authMiddleware, authorize('org_admin', 'super_admin'), createOpportunity);
router.put('/:id', writeLimiter, authMiddleware, authorize('org_admin', 'super_admin'), updateOpportunity);
router.delete('/:id', writeLimiter, authMiddleware, authorize('org_admin', 'super_admin'), deleteOpportunity);

module.exports = router;
