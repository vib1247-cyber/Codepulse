import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.isAdmin ? 'admin' : 'user',
          isAdmin: user.isAdmin || false
        }
      },
      token: req.headers.authorization?.split(' ')[1]
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    console.error('Token verification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const registerUser = async (req, res) => {
  console.log('✅ Register endpoint hit');
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request method:', req.method);
  console.log('Request URL:', req.originalUrl);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    console.log('✅ Registered:', user.email);
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
      token
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both email and password' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin || false
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    console.log('Login successful for user:', user.email);
    
    // Send response with token and user data
    const response = {
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.isAdmin ? 'admin' : 'user',
          isAdmin: user.isAdmin || false
        }
      },
      token
    };

    console.log('Sending login response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};