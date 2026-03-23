const { verifyToken } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

/**
 * Middleware to verify Clerk token and sync user with database
 * Used for routes that accept Clerk authentication
 */
const clerkAuth = async (req, res, next) => {
  try {
    const { authorization: authHeader } = req.headers;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const secret = process.env.CLERK_SECRET_KEY;

    if (!secret) {
      console.error('CLERK_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify Clerk token
    let decoded;
    try {
      decoded = await verifyToken(token, { secretKey: secret });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Extract user info from Clerk token
    const clerkData = {
      clerkId: decoded.sub,
      email: decoded.email_addresses?.[0]?.email_address || decoded.email,
      name: decoded.first_name ? `${decoded.first_name} ${decoded.last_name || ''}`.trim() : 'Clerk User',
      role: 'student', // Default role for social auth users
    };

    // Sync user with database (create if not exists, update if exists)
    let user = await User.findOne({ email: clerkData.email });

    if (!user) {
      // Create new user from Clerk data
      user = await User.create({
        name: clerkData.name,
        email: clerkData.email,
        role: clerkData.role,
        isVerified: true, // Clerk already verifies email
        password: null, // No password for OAuth users
      });
      console.log('✓ New Clerk user created:', clerkData.email);
    } else if (!user.isVerified) {
      // Auto-verify existing user if logging in with Clerk
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      clerkId: clerkData.clerkId,
    };

    next();
  } catch (error) {
    console.error('Clerk auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = clerkAuth;
