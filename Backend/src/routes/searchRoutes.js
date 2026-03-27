const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const searchController = require('../controllers/searchController');
const { validateSearch } = require('../validators/searchValidator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Search endpoint: 20 requests per minute per IP
const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  skip: (req) => {
    // Skip rate limiting for authenticated admin requests
    return req.user && req.user.role === 'admin';
  },
});

// Verify endpoint: 30 requests per minute per IP
const verifyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  skip: (req) => {
    // Skip rate limiting for authenticated admin requests
    return req.user && req.user.role === 'admin';
  },
});

// ─── Public Search Endpoints ──────────────────────────────────────────────────

// GET /api/search?certificateId=CERT-001
// Search for a certificate by ID (case-insensitive)
router.get('/', searchRateLimiter, validateSearch, searchController.searchCertificate);

// POST /api/search/verify (Bulk verification - multiple certificates)
// Verify multiple certificates in one request
// IMPORTANT: Must be BEFORE the GET /verify/:certificateId route!
router.post('/verify', verifyRateLimiter, searchController.verifyBulkCertificates);

// GET /api/search/verify/:certificateId
// Verify a certificate ID (public verification endpoint)
router.get('/verify/:certificateId', verifyRateLimiter, searchController.verifyCertificate);

// ─── Admin Search Endpoints ───────────────────────────────────────────────────

// GET /api/admin/search-logs (requires authentication and admin role)
router.get('/admin/search-logs', authenticate, authorize(['admin']), searchController.getSearchLogs);

module.exports = router;
