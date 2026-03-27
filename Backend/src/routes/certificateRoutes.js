const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const certificateController = require('../controllers/certificateController');

// Rate limiter: 10 requests per minute per IP for all certificate endpoints
const certRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

router.use(certRateLimiter);

// ─── Public Certificate Endpoints ─────────────────────────────────────────────
router.get('/:certificateId',          certificateController.getCertificateData);
router.get('/:certificateId/preview',  certificateController.previewCertificate);
router.get('/:certificateId/download', certificateController.downloadCertificate);

module.exports = router;
