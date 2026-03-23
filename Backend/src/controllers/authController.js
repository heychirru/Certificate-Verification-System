const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/sendEmail');
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

    // Generate verification token (32-byte hex string)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: 'Failed to send verification email. Please try again later.',
      });
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: user._id,
      email: user.email,
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

    // Check if user verified their email
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        email: user.email,
      });
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

    // Rotate the refresh token — old token is invalidated immediately
    const newRefreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, newRefreshToken);

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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify user email with token from email link
// @route   GET /api/auth/verify-email?token=...
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    console.log('🔍 Attempting to verify token:', token.substring(0, 10) + '...');

    // Find user with matching verification token
    const user = await User.findOne({ verificationToken: token }).select(
      '+verificationToken +verificationTokenExpiry'
    );

    if (!user) {
      console.warn('❌ No user found with this token');
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    console.log('✓ User found:', user.email);

    // Check if token has expired
    if (user.verificationTokenExpiry < new Date()) {
      console.warn('❌ Token expired for:', user.email);
      return res.status(400).json({
        error: 'Verification token has expired. Please request a new one.',
        email: user.email,
      });
    }

    // Mark email as verified and clear verification fields
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save({ validateBeforeSave: false });

    console.log('✅ Email verified successfully:', user.email);

    res.status(200).json({
      message: 'Email verified successfully! You can now login.',
      email: user.email,
      isVerified: true,
    });
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Request a new verification email (if token expired)
// @route   POST /api/auth/resend-verification
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select(
      '+verificationToken +verificationTokenExpiry'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If already verified, no need to resend
    if (user.isVerified) {
      return res.status(400).json({
        error: 'This email is already verified. You can login now.',
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, user.name);
    } catch (emailError) {
      return res.status(500).json({
        error: 'Failed to send verification email. Please try again later.',
      });
    }

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    DEBUG: Check if user email is verified (for troubleshooting)
// @route   GET /api/auth/check-verification?email=...
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const checkVerificationStatus = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    // Find user without any field restrictions
    const user = await User.findOne({ email }).select(
      'email isVerified verificationTokenExpiry'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();

    res.status(200).json({
      email: user.email,
      isVerified: user.isVerified,
      verificationTokenExpiry: user.verificationTokenExpiry,
      tokenExpired: user.verificationTokenExpiry ? user.verificationTokenExpiry < now : 'N/A',
      message: user.isVerified
        ? 'User is verified ✓ You should be able to login now'
        : 'User is NOT verified ✗ Click verification link in email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    DEBUG: Manually verify user by email (for testing)
// @route   POST /api/auth/verify-manual
// @access  Public (for development only - remove in production!)
// ─────────────────────────────────────────────────────────────────────────────
const manualVerifyUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save({ validateBeforeSave: false });

    console.log('✅ MANUAL VERIFICATION:', email);

    res.status(200).json({
      message: 'User manually verified successfully!',
      email: user.email,
      isVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Exchange Clerk token for JWT tokens (for OAuth users: Google, GitHub)
// @route   POST /api/auth/clerk-token
// @access  Public (with Clerk token)
// ─────────────────────────────────────────────────────────────────────────────
const clerkTokenExchange = async (req, res, next) => {
  try {
    const { verifyToken } = require('@clerk/clerk-sdk-node');
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.error('❌ No Clerk token in authorization header');
      return res.status(400).json({ error: 'Clerk token is required' });
    }

    console.log('🔍 Verifying Clerk token, length:', token.length);

    // Verify Clerk token
    let decoded;
    try {
      decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    } catch (err) {
      console.error('❌ Clerk token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid Clerk token: ' + err.message });
    }

    console.log('✓ Clerk token verified, decoded claims:', Object.keys(decoded));

    // Extract email and name from token (handle both custom template and default token)
    let email = decoded.email_addresses?.[0]?.email_address || 
                decoded.email || 
                decoded.primary_email_address ||
                decoded['email@clerk.com']?.primary_email_address;

    let name = decoded.first_name ? `${decoded.first_name} ${decoded.last_name || ''}`.trim() : 'Clerk User';

    // Fallback: extract from custom claims if email not found
    if (!email && decoded.email) {
      email = decoded.email;
    }

    if (!email) {
      console.error('❌ No email found in Clerk token. Available claims:', Object.keys(decoded));
      return res.status(400).json({ error: 'Email not found in Clerk token' });
    }

    console.log('✓ Extracted email:', email, 'name:', name);

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      console.log('📝 Creating new user from Clerk:', email);
      user = await User.create({
        name,
        email,
        role: 'student',
        isVerified: true,
        password: require('crypto').randomBytes(16).toString('hex'), // Dummy password
      });
      console.log('✓ New Clerk user registered:', email);
    } else if (!user.isVerified) {
      console.log('📝 Verifying existing user:', email);
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
      console.log('✓ User verified:', email);
    } else {
      console.log('✓ User already exists and verified:', email);
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    console.log('✅ Clerk authentication successful for:', email);

    res.status(200).json({
      accessToken,
      user: user.toSafeObject(),
      message: 'Clerk authentication successful',
    });
  } catch (error) {
    console.error('❌ clerkTokenExchange error:', error);
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
  verifyEmail,
  resendVerification,
  checkVerificationStatus,
  manualVerifyUser,
  clerkTokenExchange,
};