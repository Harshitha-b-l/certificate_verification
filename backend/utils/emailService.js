const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter using SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(to, verificationCode) {
    try {
      await this.transporter.sendMail({
        from: `"Certificate Verification" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Your Verification Code',
        html: `
          <h1>Verification Code</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 15 minutes.</p>
        `
      });

      return true;
    } catch (error) {
      console.error('Email Send Error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendCertificateNotification(to, certificateDetails) {
    try {
      await this.transporter.sendMail({
        from: `"Certificate Verification" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'New Certificate Uploaded',
        html: `
          <h1>New Certificate Notification</h1>
          <p>A new certificate has been uploaded:</p>
          <ul>
            <li><strong>Title:</strong> ${certificateDetails.title}</li>
            <li><strong>Issuer:</strong> ${certificateDetails.issuer}</li>
            <li><strong>Issue Date:</strong> ${certificateDetails.issueDate}</li>
          </ul>
        `
      });

      return true;
    } catch (error) {
      console.error('Certificate Notification Email Error:', error);
      throw new Error('Failed to send certificate notification');
    }
  }

  async sendPasswordResetEmail(to, resetToken) {
    try {
      await this.transporter.sendMail({
        from: `"Certificate Verification" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>You have requested a password reset. Use the following token to reset your password:</p>
          <p><strong>${resetToken}</strong></p>
          <p>This token will expire in 1 hour.</p>
        `
      });

      return true;
    } catch (error) {
      console.error('Password Reset Email Error:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();