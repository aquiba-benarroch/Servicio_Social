// ========================================
// AUTHENTICATION CONTROLLER
// ========================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone, organizationId } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and name'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'volunteer',
      phone,
      organizationId
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        message: 'User registered successfully'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Error registering user'
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Generate token
    const token = generateToken(user._id);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        expiresAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging in'
    });
  }
};

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
exports.verify = async (req, res) => {
  try {
    // User is already attached by auth middleware
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying token'
    });
  }
};
