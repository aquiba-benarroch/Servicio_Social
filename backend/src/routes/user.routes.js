// ========================================
// USER ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');
const { apiLimiter, writeLimiter } = require('../middleware/rate-limit.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get all users (Admin only)
router.get('/', apiLimiter, authorize('super_admin', 'org_admin'), getAllUsers);

// Get user by ID
router.get('/:id', apiLimiter, getUserById);

// Update user
router.put('/:id', writeLimiter, updateUser);

// Delete user (Admin only)
router.delete('/:id', writeLimiter, authorize('super_admin'), deleteUser);

module.exports = router;
