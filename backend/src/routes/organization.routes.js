// ========================================
// ORGANIZATION ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organization.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const { apiLimiter, writeLimiter } = require('../middleware/rate-limit.middleware');

// Public routes
router.get('/', apiLimiter, getAllOrganizations);
router.get('/:id', apiLimiter, getOrganizationById);

// Protected routes
router.post('/', writeLimiter, authMiddleware, authorize('org_admin', 'super_admin'), createOrganization);
router.put('/:id', writeLimiter, authMiddleware, authorize('org_admin', 'super_admin'), updateOrganization);
router.delete('/:id', writeLimiter, authMiddleware, authorize('super_admin'), deleteOrganization);

module.exports = router;
