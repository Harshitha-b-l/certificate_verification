const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to upload a new certificate (for institutions)
router.post('/upload', 
  authMiddleware.authenticateInstitution,
  certificateController.uploadCertificate
);

// Route to get user's certificates
router.get('/user', 
  authMiddleware.authenticateUser,
  certificateController.getUserCertificates
);

// Route to verify a certificate
router.post('/verify', 
  certificateController.verifyCertificate
);

// Route to generate shareable verification link
router.post('/generate-link/:certificateId', 
  authMiddleware.authenticateUser,
  certificateController.generateVerificationLink
);

// Route to access certificate via verification link
router.get('/access/:accessToken', 
  certificateController.accessCertificateByLink
);

// Route to download certificate (with verification)
router.get('/download/:certificateId', 
  authMiddleware.authenticateUser,
  certificateController.downloadCertificate
);

module.exports = router;