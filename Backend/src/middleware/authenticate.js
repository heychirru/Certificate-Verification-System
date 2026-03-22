const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Authenticate request via JWT
 * Attaches decoded user to req.user = { id, role }
 */
const authenticate = async (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ──────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // ── 2. Verify token signature and expiry ────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // ── 3. Check user still exists in DB ────────────────────────────────────
    const user = await User.findById(decoded.id).select('_id role');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User no longer exists' });
    }

    // ── 4. Attach user to request ────────────────────────────────────────────
    req.user = { id: user._id, role: user.role };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;