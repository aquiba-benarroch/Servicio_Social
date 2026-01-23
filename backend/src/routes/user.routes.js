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

// All routes require authentication
router.use(authMiddleware);

// Get all users (Admin only)
router.get('/', authorize('super_admin', 'org_admin'), getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('super_admin'), deleteUser);

module.exports = router;
