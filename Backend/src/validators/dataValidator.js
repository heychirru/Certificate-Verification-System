const { body } = require('express-validator');

const studentFields = [
  body('certificateId')
    .trim()
    .notEmpty().withMessage('Certificate ID is required')
    .isString().withMessage('Certificate ID must be a string'),

  body('studentName')
    .trim()
    .notEmpty().withMessage('Student name is required')
    .isLength({ min: 2 }).withMessage('Student name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('internshipDomain')
    .trim()
    .notEmpty().withMessage('Internship domain is required'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

// For updates, all fields optional but still validated if provided
const updateStudentFields = [
  body('studentName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Student name must be at least 2 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('internshipDomain')
    .optional()
    .trim()
    .notEmpty().withMessage('Internship domain cannot be empty'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

module.exports = { studentFields, updateStudentFields };
