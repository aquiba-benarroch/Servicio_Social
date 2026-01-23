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

// Public routes
router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes
router.post('/', authMiddleware, authorize('org_admin', 'super_admin'), createOpportunity);
router.put('/:id', authMiddleware, authorize('org_admin', 'super_admin'), updateOpportunity);
router.delete('/:id', authMiddleware, authorize('org_admin', 'super_admin'), deleteOpportunity);

module.exports = router;
