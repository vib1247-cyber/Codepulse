import express from 'express';
import { auth } from '../middleware/auth.js';
import { executeCode } from '../controllers/codeController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// Execute code
router.post('/', executeCode);

export default router;
