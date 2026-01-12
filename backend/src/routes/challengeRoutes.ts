import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTodayChallenge,
  submitChallengeAnswer,
  getUserStreak,
  getChallengeHistory,
  resetTodayChallenge,
} from '../controllers/challengeController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get today's challenge
router.get('/today', getTodayChallenge);

// Submit challenge answer
router.post('/submit', submitChallengeAnswer);

// Get user streak
router.get('/streak', getUserStreak);

// Get challenge history
router.get('/history', getChallengeHistory);

// Reset today's challenge (for testing)
router.delete('/reset', resetTodayChallenge);

export default router;
