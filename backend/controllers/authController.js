const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.signup = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or phone number' 
      });
    }

    // Create new user
    const user = new User({ 
      name, 
      email, 
      phoneNumber, 
      password 
    });

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}. 
             This code will expire in 15 minutes.`
    });

    res.status(201).json({ 
      message: 'User registered successfully. Check your email for verification code.' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error in user registration', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({ 
        message: 'Account is locked. Please reset your password.' 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      
      // Lock account after 3 failed attempts
      if (user.loginAttempts >= 3) {
        user.isLocked = true;
      }
      await user.save();

      return res.status(401).json({ 
        message: 'Invalid credentials', 
        attempts: 3 - user.loginAttempts 
      });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login error', 
      error: error.message 
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Use this token to reset your password: ${resetToken}
             This token will expire in 1 hour.`
    });

    res.status(200).json({ 
      message: 'Password reset instructions sent to your email' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing password reset', 
      error: error.message 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.isLocked = false;

    await user.save();

    res.status(200).json({ 
      message: 'Password reset successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};