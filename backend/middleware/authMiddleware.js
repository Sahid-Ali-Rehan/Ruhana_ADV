const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user data to request
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ message: 'Invalid or expired token' });
  }
};



module.exports = authMiddleware;
