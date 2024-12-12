const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  uploadCertificate,
  verifyCertificate 
} = require('../controllers/authController');
const { 
  registerValidation, 
  loginValidation,
  certificateUploadValidation 
} = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/tokenGenerator');
const { generateQRCode } = require('../utils/qrCodeGenerator');

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Routes
router.post('/upload-certificate', 
  authenticateToken, 
  certificateUploadValidation, 
  uploadCertificate
);

router.get('/verify-certificate/:certificateId', 
  authenticateToken, 
  verifyCertificate
);

router.get('/generate-qr/:certificateId', 
  authenticateToken, 
  async (req, res) => {
    try {
      const qrCode = await generateQRCode(req.params.certificateId);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: 'QR Code generation failed' });
    }
  }
);

module.exports = router;