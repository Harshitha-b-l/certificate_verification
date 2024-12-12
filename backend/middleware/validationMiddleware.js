const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must include uppercase, lowercase, number, and special character'),
  body('role').isIn(['student', 'institution']).withMessage('Invalid role'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const certificateUploadValidation = [
  body('studentName').trim().notEmpty().withMessage('Student name is required'),
  body('institutionName').trim().notEmpty().withMessage('Institution name is required'),
  body('graduationDate').isDate().withMessage('Invalid graduation date'),
  body('certificateHash').notEmpty().withMessage('Certificate hash is required'),
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation,
  certificateUploadValidation
};