const Certificate = require('../models/certificate');
const User = require('../models/user');
const Institution = require('../models/institution');
const IPFSService = require('../utils/ipfsService');
const BlockchainService = require('../utils/blockchainService');
const crypto = require('crypto');

exports.uploadCertificate = async (req, res) => {
  try {
    const { 
      studentEmail, 
      certificateTitle, 
      additionalMetadata 
    } = req.body;

    // Find student by email
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(6).toString('hex');

    // Upload document to IPFS
    const ipfsResult = await IPFSService.uploadFile(req.file);

    // Create blockchain transaction
    const blockchainResult = await BlockchainService.registerCertificate({
      studentId: student._id,
      institutionId: req.institution._id,
      certificateTitle,
      ipfsHash: ipfsResult.hash
    });

    // Create certificate record
    const certificate = new Certificate({
      title: certificateTitle,
      issuer: req.institution._id,
      student: student._id,
      ipfsHash: ipfsResult.hash,
      blockchainTransactionHash: blockchainResult.transactionHash,
      verificationCode,
      metadata: additionalMetadata || {},
      expirationDate: new Date(Date.now() + 365*24*60*60*1000) // 1 year from now
    });

    // Generate unique access token
    certificate.accessToken = certificate.generateAccessToken();

    await certificate.save();

    // Add certificate to student's records
    student.certificates.push(certificate._id);
    await student.save();

    res.status(201).json({ 
      message: 'Certificate uploaded successfully', 
      certificateId: certificate._id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading certificate', 
      error: error.message 
    });
  }
};

exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('issuer', 'name')
      .select('-verificationCode');

    res.status(200).json({ certificates });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving certificates', 
      error: error.message 
    });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { 
      certificateId, 
      verificationCode,
      studentName,
      issuerName
    } = req.body;

    const certificate = await Certificate.findById(certificateId)
      .populate('issuer', 'name')
      .populate('student', 'name');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Verification steps
    if (certificate.verificationCode !== verificationCode) {
      return res.status(400).json({ 
        message: 'Invalid verification code',
        attemptsRemaining: 3 // Implement attempt tracking
      });
    }

    // Name verification
    const nameMatches = 
      certificate.student.name.toLowerCase() === studentName.toLowerCase() &&
      certificate.issuer.name.toLowerCase() === issuerName.toLowerCase();

    if (!nameMatches) {
      return res.status(400).json({ 
        message: 'Name verification failed' 
      });
    }

    // Blockchain verification
    const blockchainVerification = await BlockchainService.verifyCertificate(
      certificate.blockchainTransactionHash
    );

    if (!blockchainVerification) {
      return res.status(400).json({ 
        message: 'Blockchain verification failed' 
      });
    }

    res.status(200).json({ 
      message: 'Certificate verified successfully',
      certificateDetails: {
        title: certificate.title,
        issuer: certificate.issuer.name,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Verification error', 
      error: error.message 
    });
  }
};

exports.generateVerificationLink = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.certificateId,
      student: req.user._id
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Generate a unique, time-limited access token
    const accessToken = certificate.generateAccessToken();
    certificate.accessToken = accessToken;
    await certificate.save();

    // Construct verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${accessToken}`;

    res.status(200).json({ 
      verificationUrl,
      expiresAt: new Date(Date.now() + 24*60*60*1000) // 24 hours 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating verification link', 
      error: error.message 
    });
  }
};

exports.accessCertificateByLink = async (req, res) => {
  try {
    const { accessToken } = req.params;
    const { passkey } = req.body;

    const certificate = await Certificate.findOne({ 
      accessToken,
      isActive: true 
    }).populate('issuer', 'name');

    if (!certificate) {
      return res.status(404).json({ message: 'Invalid or expired link' });
    }

    // Verify passkey if provided
    if (passkey !== certificate.accessToken) {
      return res.status(403).json({ message: 'Invalid access' });
    }

    // Return certificate details (without sensitive information)
    res.status(200).json({
      certificateTitle: certificate.title,
      issuer: certificate.issuer.name,
      issueDate: certificate.issueDate,
      ipfsHash: certificate.ipfsHash
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error accessing certificate', 
      error: error.message 
    });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.certificateId,
      student: req.user._id
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Retrieve file from IPFS
    const fileStream = await IPFSService.downloadFile(certificate.ipfsHash);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=${certificate.title}.pdf`
    );

    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error downloading certificate', 
      error: error.message 
    });
  }
};