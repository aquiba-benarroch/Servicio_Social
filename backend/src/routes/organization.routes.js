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

// Public routes
router.get('/', getAllOrganizations);
router.get('/:id', getOrganizationById);

// Protected routes
router.post('/', authMiddleware, authorize('org_admin', 'super_admin'), createOrganization);
router.put('/:id', authMiddleware, authorize('org_admin', 'super_admin'), updateOrganization);
router.delete('/:id', authMiddleware, authorize('super_admin'), deleteOrganization);

module.exports = router;
