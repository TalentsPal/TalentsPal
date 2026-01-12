import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPracticeQuestions,
  getCompanies,
  getTags,
  checkPracticeAnswer,
} from '../controllers/practiceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get practice questions with filters
router.get('/questions', getPracticeQuestions);

// Get available companies
router.get('/companies', getCompanies);

// Get available tags
router.get('/tags', getTags);

// Check practice answer
router.post('/check-answer', checkPracticeAnswer);

export default router;
