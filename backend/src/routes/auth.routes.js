// ========================================
// AUTHENTICATION ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/verify', authMiddleware, verify);

module.exports = router;
