const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  registerStudent,
  registerAdmin,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const requireJsonBody = require('../middleware/requireJsonBody');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Strict limiter for login: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limiter for registration: 10 attempts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', registerLimiter, requireJsonBody, validateRegister, registerStudent);

// @route   POST /api/auth/admin/register
// @desc    Register a new admin (admin only)
// @access  Private - Admin
router.post(
  '/admin/register',
  authenticate,
  authorize(['admin']),
  requireJsonBody,
  validateRegister,
  registerAdmin
);

// @route   POST /api/auth/login
// @desc    Login and receive access token + refresh token cookie
// @access  Public
router.post('/login', loginLimiter, requireJsonBody, validateLogin, login);

// @route   POST /api/auth/refresh
// @desc    Get a new access token using refresh token cookie
// @access  Public (cookie-based)
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout and invalidate refresh token
// @access  Private - Authenticated
router.post('/logout', authenticate, logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private - Authenticated
router.get('/me', authenticate, getMe);

module.exports = router;