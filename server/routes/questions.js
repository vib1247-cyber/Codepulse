import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (read-only)
router.route('/')
  .get(getQuestions);

router.route('/:id')
  .get(getQuestion);

// Protected routes (require authentication and admin role for write operations)
router.use(auth);
router.use(authorize('admin'));

router.route('/')
  .post(createQuestion);

router.route('/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
