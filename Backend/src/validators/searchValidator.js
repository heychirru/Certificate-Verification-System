const { query, validationResult } = require('express-validator');

// ─── Reusable validation result handler ───────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Search Validator ──────────────────────────────────────────────────────────
// certificateId must be alphanumeric and hyphens only, max 50 characters
const validateSearch = [
  query('certificateId')
    .trim()
    .notEmpty().withMessage('certificateId is required')
    .isLength({ max: 50 }).withMessage('certificateId must not exceed 50 characters')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('Invalid certificate ID format. Only alphanumeric and hyphens are allowed'),

  handleValidationErrors,
];

module.exports = { validateSearch };
