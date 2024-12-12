const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for institution registration
router.post('/register', 
  institutionController.registerInstitution
);

// Route for institution login
router.post('/login', 
  institutionController.login
);

// Route to verify institution (admin route)
router.post('/verify/:institutionId', 
  authMiddleware.authenticateAdmin,
  institutionController.verifyInstitution
);

// Route to get institution profile
router.get('/profile', 
  authMiddleware.authenticateInstitution,
  institutionController.getInstitutionProfile
);

// Route to update institution profile
router.put('/profile', 
  authMiddleware.authenticateInstitution,
  institutionController.updateInstitutionProfile
);

// Route to upload verification documents
router.post('/documents', 
  authMiddleware.authenticateInstitution,
  institutionController.uploadVerificationDocuments
);

module.exports = router;