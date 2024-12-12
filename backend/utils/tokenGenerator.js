const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const generateResetPasswordToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      type: 'password_reset' 
    }, 
    process.env.JWT_RESET_SECRET, 
    { expiresIn: '15m' }
  );
};

module.exports = {
  generateToken,
  authenticateToken,
  generateResetPasswordToken
};