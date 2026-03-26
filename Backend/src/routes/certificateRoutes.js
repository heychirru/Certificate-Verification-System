const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const certificateController = require('../controllers/certificateController');

// Rate limiter: 10 requests per minute per IP for general certificate endpoints
const certRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Rate limiter: 5 requests per minute per IP for download (intensive operation)
const downloadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many download requests, please try again later' },
  skip: (req, res) => {
    // Skip rate limiting for admin users (if user attached to request)
    return req.user && req.user.role === 'admin';
  },
});

router.use(certRateLimiter);

// ─── Public Certificate Endpoints ─────────────────────────────────────────────
router.get('/:certificateId',          certificateController.getCertificateData);
router.get('/:certificateId/preview',  certificateController.previewCertificate);
router.get('/:certificateId/download', downloadRateLimiter, certificateController.downloadCertificate);

module.exports = router;
