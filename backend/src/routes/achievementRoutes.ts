import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserAchievements,
  getAchievementProgress,
} from '../controllers/achievementController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all achievements for the user
router.get('/', getUserAchievements);

// Get achievement progress
router.get('/progress', getAchievementProgress);

export default router;
