import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getStudentAnalytics,
  getLeaderboard,
  getUserLeaderboardPosition,
} from '../controllers/analyticsController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get student analytics
router.get('/student', getStudentAnalytics);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get user's leaderboard position
router.get('/leaderboard/position', getUserLeaderboardPosition);

export default router;
