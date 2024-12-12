const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpiry: {
    type: Date,
    default: null
  },
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification code
UserSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  return code;
};

// Method to validate verification code
UserSchema.methods.validateVerificationCode = function(code) {
  return (
    this.verificationCode === code && 
    this.verificationCodeExpiry > Date.now()
  );
};

module.exports = mongoose.model('User', UserSchema);