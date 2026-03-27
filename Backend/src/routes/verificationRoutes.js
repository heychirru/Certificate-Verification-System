const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const verificationController = require('../controllers/verificationController');

// Rate limiter for verification endpoints
const verificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification requests, please try again later' },
});

router.use(verificationRateLimiter);

// ─── Employer Verification Routes ─────────────────────────────────────────────

/**
 * POST /api/verify/employer
 * Verify employer by name against ORB Intelligence database
 * Request body: { "employerName": "Company Name" }
 */
router.post('/employer', verificationController.verifyEmployerByName);

/**
 * POST /api/verify/certificate/:certificateId/employer
 * Verify the employer listed on a specific certificate
 */
router.post('/certificate/:certificateId/employer', verificationController.verifyCertificateEmployer);

// ─── LinkedIn Verification Routes ────────────────────────────────────────────

/**
 * GET /api/verify/linkedin/auth-url
 * Get LinkedIn OAuth authorization URL for student login
 * Returns: { authUrl, state }
 */
router.get('/linkedin/auth-url', verificationController.getLinkedInAuthUrl);

/**
 * POST /api/verify/certificate/:certificateId/linkedin
 * Verify certificate against student's LinkedIn work history
 * Request body: { "accessToken": "linkedin_access_token" }
 */
router.post('/certificate/:certificateId/linkedin', verificationController.verifyWithLinkedIn);

// ─── Full Verification Routes ────────────────────────────────────────────────

/**
 * POST /api/verify/certificate/:certificateId/full
 * Full verification: Check employer + optional LinkedIn profile
 * Request body: { "linkedInAccessToken": "optional_token" }
 */
router.post('/certificate/:certificateId/full', verificationController.fullCertificateVerification);

module.exports = router;
