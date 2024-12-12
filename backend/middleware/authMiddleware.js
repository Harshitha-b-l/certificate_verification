const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Institution = require('../models/institution');

exports.authenticateUser = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({ 
      _id: decoded.id, 
      email: decoded.email 
    });

    if (!user) {
      throw new Error();
    }

    // Attach user to request object
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

exports.authenticateInstitution = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find institution
    const institution = await Institution.findOne({ 
      _id: decoded.id, 
      email: decoded.email 
    });

    if (!institution) {
      throw new Error();
    }

    // Check if institution is verified
    if (!institution.isVerified) {
      return res.status(403).json({ 
        message: 'Institution is not verified' 
      });
    }

    // Attach institution to request object
    req.token = token;
    req.institution = institution;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is an admin (you'd typically have an admin flag in your user model)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin rights required' 
      });
    }

    // Find admin user
    const adminUser = await User.findOne({ 
      _id: decoded.id, 
      role: 'admin' 
    });

    if (!adminUser) {
      throw new Error();
    }

    // Attach admin to request object
    req.token = token;
    req.admin = adminUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate as an admin' });
  }
};