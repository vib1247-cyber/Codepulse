import express from 'express';
import { auth, admin } from '../middleware/auth.js';
import { 
  createSubmission, 
  getUserSubmissions, 
  getAllSubmissions 
} from '../controllers/submissionController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// Create a new submission
router.post('/', createSubmission);

// Get user's submissions for a question
router.get('/:questionId', getUserSubmissions);

// Admin route to get all submissions
router.get('/', admin, getAllSubmissions);

export default router;
