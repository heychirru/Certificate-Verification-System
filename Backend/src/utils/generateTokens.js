const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived JWT access token
 * @param {Object} payload - { id, role }
 * @returns {string} signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generate a long-lived JWT refresh token
 * @param {Object} payload - { id }
 * @returns {string} signed JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Set refresh token as HTTP-only cookie on the response
 * @param {Object} res - Express response object
 * @param {string} token - Refresh token string
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,                                    // Not accessible via JS
    secure: process.env.NODE_ENV === 'production',     // HTTPS only in prod
    sameSite: 'Strict',                                // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                 // 7 days in ms
  });
};

/**
 * Clear the refresh token cookie
 * @param {Object} res - Express response object
 */
const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(0), // Immediately expire
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
