import express from 'express';
import passport from 'passport';
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  oauthCallback,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Public Routes
 */
router.post('/signup', signup);
router.post('/login', login);

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

console.log('🔍 Setting up Google auth route...');
// Google Auth
router.get(
  '/google',
  (req, res, next) => {
    console.log('📍 Google auth route hit!');
    next();
  },
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

export default router;
