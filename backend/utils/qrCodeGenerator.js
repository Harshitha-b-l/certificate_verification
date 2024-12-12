const QRCode = require('qrcode');
const Certificate = require('../models/certificate');

const generateQRCode = async (certificateId) => {
  try {
    // Fetch certificate details
    const certificate = await Certificate.findById(certificateId);
    
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Generate verification URL
    const verificationUrl = `${process.env.BASE_URL}/verify/${certificateId}`;

    // Generate QR Code
    const qrCodeOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const qrCodeImage = await QRCode.toDataURL(verificationUrl, qrCodeOptions);

    return {
      qrCode: qrCodeImage,
      verificationUrl: verificationUrl
    };
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    throw error;
  }
};

module.exports = { generateQRCode };