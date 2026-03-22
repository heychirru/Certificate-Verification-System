const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/generateTokens');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new student account
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({ name, email, password, role: 'student' });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new admin account (Admin only)
// @route   POST /api/auth/admin/register
// @access  Private - Admin
// ─────────────────────────────────────────────────────────────────────────────
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Create admin user
    const admin = await User.create({ name, email, password, role: 'admin' });

    res.status(201).json({
      message: 'Admin registered successfully',
      userId: admin._id,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user and return access token + refresh token cookie
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user and explicitly include password field (select: false by default)
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare provided password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token cookie)
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Find user and validate stored refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Refresh token is invalid or has been revoked' });
    }

    // Issue new access token
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout user - invalidate refresh token
// @route   POST /api/auth/logout
// @access  Private - Authenticated
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // Remove refresh token from DB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear the cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private - Authenticated
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  registerAdmin,
  login,
  refreshToken,
  logout,
  getMe,
};