import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Grant access to admin users
const authorize = (...roles) => {
  return (req, res, next) => {
    // If checking for admin and user is admin, allow access
    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }
    
    // If no specific roles required, just check if user is authenticated
    if (roles.length === 0) {
      return next();
    }
    
    // Otherwise, deny access
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this route'
    });
  };
};

const auth = async (req, res, next) => {
  console.log('Auth middleware - Headers:', JSON.stringify(req.headers, null, 2));
  
  // Get token from header
  let token = req.header('Authorization');
  
  // Check if no token
  if (!token) {
    console.error('No token provided in Authorization header');
    return res.status(401).json({ 
      success: false,
      msg: 'No token provided, authorization denied' 
    });
  }

  // Remove 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  } else {
    console.log('No Bearer prefix found in token');
  }

  // Clean token (remove any quotes or whitespace)
  token = token.replace(/^['"]|['"]$/g, '').trim();

  if (!token) {
    console.error('Token is empty after cleaning');
    return res.status(401).json({ 
      success: false,
      msg: 'Invalid token format' 
    });
  }

  try {
    console.log('Verifying token...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully, user id:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error('User not found for ID:', decoded.id);
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', {
      name: err.name,
      message: err.message,
      expiredAt: err.expiredAt,
      token: token ? `${token.substring(0, 10)}...` : 'no token'
    });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Token has expired' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      msg: 'Token verification failed' 
    });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized as admin' 
    });
  }
  next();
};

export { auth, authorize, admin };
