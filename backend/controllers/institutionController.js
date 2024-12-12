const Institution = require('../models/institution');
const BlockchainService = require('../utils/blockchainService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // For password encryption

// Institution Registration
exports.registerInstitution = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      registrationNumber,
      contactNumber,
      address
    } = req.body;

    // Check if institution already exists
    const existingInstitution = await Institution.findOne({ 
      $or: [{ email }, { registrationNumber }] 
    });

    if (existingInstitution) {
      return res.status(400).json({ 
        message: 'Institution already registered' 
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create blockchain NFT for institution
    const nftTokenId = await BlockchainService.mintInstitutionNFT({
      name,
      registrationNumber
    });

    // Create new institution
    const institution = new Institution({
      name,
      email,
      password: hashedPassword, // Store hashed password
      registrationNumber,
      contactNumber,
      address,
      nftTokenId,
      isVerified: false // Initial verification status
    });

    await institution.save();

    res.status(201).json({ 
      message: 'Institution registered successfully',
      institutionId: institution._id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration error', 
      error: error.message 
    });
  }
};

// Institution Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const institution = await Institution.findOne({ email });

    if (!institution) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if institution is verified
    if (!institution.isVerified) {
      return res.status(403).json({ 
        message: 'Institution is not yet verified' 
      });
    }

    // Compare password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, institution.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { institutionId: institution._id, email: institution.email },
      process.env.JWT_SECRET, // Store your secret key in .env
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login error', 
      error: error.message 
    });
  }
};

// Verify Institution (optional endpoint)
exports.verifyInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const institution = await Institution.findById(institutionId);

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    institution.isVerified = true;
    await institution.save();

    res.status(200).json({ message: 'Institution verified successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Verification error', 
      error: error.message 
    });
  }
};
