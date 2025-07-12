import express from 'express';
import { auth as protect } from '../middleware/auth.js';
import {
  createInterview,
  joinInterview,
  getInterview,
  matchUserForInterview
} from '../controllers/interviewController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Create a new interview
router.post('/', createInterview);

// Join an existing interview
router.post('/join/:roomId', joinInterview);

// Get interview details
router.get('/:roomId', getInterview);

// Match with another user for an interview
router.get('/match', matchUserForInterview);

export default router;
