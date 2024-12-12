const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const InstitutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  nftTokenId: {
    type: String,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  contactNumber: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  certificatesIssued: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  verificationDocuments: [{
    documentType: String,
    documentUrl: String
  }],
  rejectionReason: String
}, { timestamps: true });

// Password hashing middleware
InstitutionSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check password
InstitutionSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Institution', InstitutionSchema);