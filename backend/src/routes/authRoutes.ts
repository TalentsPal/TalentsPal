import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Public Routes
 */
router.post('/signup', signup);
router.post('/login', login);

/**
 * Protected Routes - Require Authentication
 */
router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
