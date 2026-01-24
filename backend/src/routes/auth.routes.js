// ========================================
// AUTHENTICATION ROUTES
// ========================================

const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authLimiter, apiLimiter } = require('../middleware/rate-limit.middleware');

// Public routes with strict rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/verify', apiLimiter, authMiddleware, verify);

module.exports = router;
