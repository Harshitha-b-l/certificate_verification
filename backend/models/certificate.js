const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  blockchainTransactionHash: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date
  },
  verificationCode: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    unique: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate unique access token
CertificateSchema.methods.generateAccessToken = function() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

module.exports = mongoose.model('Certificate', CertificateSchema);