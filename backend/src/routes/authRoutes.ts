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

const router = express.Router();

/**
 * Public Routes
 */
router.post('/signup', signup);
router.post('/login', login);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

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
