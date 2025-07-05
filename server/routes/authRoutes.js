import express from 'express';
import { registerUser, loginUser, verifyToken } from '../controllers/authController.js';
import { auth, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Log route registrations
console.log('Registering auth routes:');
console.log('POST /api/auth/register');
console.log('POST /api/auth/login');
console.log('GET /api/auth/verify');
console.log('GET /api/auth/me');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify', auth, verifyToken);

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Fetching user profile for:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.error('User not found for ID:', req.user.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('User profile found:', { id: user._id, email: user.email });
    
    // Return consistent user data structure
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || (user.isAdmin ? 'admin' : 'user'),
          isAdmin: user.isAdmin || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working' });
});

export default router;