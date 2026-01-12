import { Router } from 'express';
import { body } from 'express-validator';
import {
  getRandomQuestions,
  getQuestionById,
  submitAnswers,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
  getUserTestHistory,
  getUserStats,
  getLeaderboard,
  getTestAttemptById,
} from '../controllers/questionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Validation middleware for creating/updating questions
const questionValidation = [
  body('questionId')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  body('category')
    .isIn(['backend', 'frontend'])
    .withMessage('Category must be either backend or frontend'),
  body('question')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question must be between 10 and 1000 characters'),
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2-6 items'),
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each option must be between 1 and 500 characters'),
  body('correctAnswer')
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Validation for answer submission
const answerValidation = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Each answer must have a questionId'),
  body('answers.*.answer')
    .trim()
    .notEmpty()
    .withMessage('Each answer must have an answer value'),
  body('category')
    .isIn(['backend', 'frontend'])
    .withMessage('Category must be either backend or frontend'),
  body('startedAt')
    .optional()
    .isISO8601()
    .withMessage('startedAt must be a valid ISO 8601 date'),
];

// ============================================
// Public Routes (for students)
// ============================================

/**
 * GET /api/questions/random
 * Get random questions for a test
 * Query params: category (required), count (optional, default 10), difficulty (optional)
 */
router.get('/random', authenticate, getRandomQuestions);

/**
 * POST /api/questions/submit
 * Submit answers and get results
 * Body: { answers: [{ questionId: string, answer: string }], category: string, startedAt?: string }
 */
router.post('/submit', authenticate, answerValidation, submitAnswers);

/**
 * GET /api/questions/history
 * Get user's test history
 * Query params: category (optional), page (optional), limit (optional)
 */
router.get('/history', authenticate, getUserTestHistory);

/**
 * GET /api/questions/stats/user
 * Get user's statistics
 * Query params: category (optional)
 */
router.get('/stats/user', authenticate, getUserStats);

/**
 * GET /api/questions/leaderboard
 * Get leaderboard
 * Query params: category (default: backend), limit (optional, max 100)
 */
router.get('/leaderboard', authenticate, getLeaderboard);

/**
 * GET /api/questions/attempt/:id
 * Get single test attempt details
 */
router.get('/attempt/:id', authenticate, getTestAttemptById);

/**
 * GET /api/questions/:id
 * Get a single question by ID (without correct answer)
 * IMPORTANT: This route must be last among GET routes to avoid catching other specific routes
 */
router.get('/:id', authenticate, getQuestionById);

// ============================================
// Admin Routes (protected - admin only)
// ============================================

/**
 * GET /api/questions/admin/all
 * Get all questions with filters (admin only)
 * Query params: category, difficulty, page, limit, includeInactive
 */
router.get('/admin/all', authenticate, authorize('admin'), getAllQuestions);

/**
 * GET /api/questions/admin/stats
 * Get question statistics (admin only)
 */
router.get('/admin/stats', authenticate, authorize('admin'), getQuestionStats);

/**
 * POST /api/questions/admin/create
 * Create a new question (admin only)
 */
router.post('/admin/create', authenticate, authorize('admin'), questionValidation, createQuestion);

/**
 * PUT /api/questions/admin/:id
 * Update a question (admin only)
 */
router.put('/admin/:id', authenticate, authorize('admin'), questionValidation, updateQuestion);

/**
 * DELETE /api/questions/admin/:id
 * Delete a question (soft delete by default, use ?permanent=true for hard delete)
 */
router.delete('/admin/:id', authenticate, authorize('admin'), deleteQuestion);

export default router;
