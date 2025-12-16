import express from 'express';
import passport from 'passport';
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  oauthCallback,
  verifyEmail,
  resendVerification,
} from '../controllers/authController';
import { uploadProfileImage, deleteProfileImage } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { rateLimiter } from '../middleware/security';

const router = express.Router();

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_REQUESTS = 5;
const GENERAL_MAX_REQUESTS = 100;

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimiter(RATE_LIMIT_WINDOW_MS, AUTH_MAX_REQUESTS);
const generalLimiter = rateLimiter(RATE_LIMIT_WINDOW_MS, GENERAL_MAX_REQUESTS);

/**
 * Public Routes
 */
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// Email verification routes
router.get('/verify-email/:token', generalLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

// Google Auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// LinkedIn Auth
router.get(
  '/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE' })
);
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

/**
 * Protected Routes - Require Authentication
 */
router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Profile image upload routes
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), uploadProfileImage);
router.delete('/delete-profile-image', authenticate, deleteProfileImage);

export default router;
