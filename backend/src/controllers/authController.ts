import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateTokenPair } from '../utils/jwt';
import { AppError, asyncHandler } from '../utils/errorHandler';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  sanitizeInput,
  isValidRole,
  isValidPhoneNumber,
} from '../utils/validation';
import {
  generateVerificationToken,
  sendVerificationEmail,
} from '../utils/email';

// Constants
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const MAX_BIO_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      phone,
      city,
      university,
      // Student fields
      linkedInUrl,
      major,
      graduationYear,
      interests,
      // Company fields
      companyName,
      companyEmail,
      companyLocation,
      industry,
      description,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !city) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Sanitize inputs
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate full name
    if (!isValidName(sanitizedFullName)) {
      throw new AppError('Full name must be between 2 and 100 characters', 400);
    }

    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message || 'Invalid password', 400);
    }

    // Validate role if provided
    if (role && !isValidRole(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Block company registration
    if (role === 'company') {
      throw new AppError('Company registration is currently disabled', 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Prepare user data
    const userData = {
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      password,
      role: role || 'student',
      phone,
      city,
      university: university || undefined,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      // Add student-specific fields
      ...(role === 'student' && {
        linkedInUrl: linkedInUrl || undefined,
        major: major || undefined,
        graduationYear: graduationYear || undefined,
        interests: interests || [],
      }),
      // Add company-specific fields
      ...(role === 'company' && {
        companyName,
        companyEmail,
        companyLocation,
        industry,
        description: description || undefined,
      }),
    };

    // Create new user
    const user = await User.create(userData);

    // Send verification email
    try {
      await sendVerificationEmail(sanitizedEmail, sanitizedFullName, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail the signup if email fails, but log it
    }

    // Send response (no tokens until email is verified)
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email before logging in. Check your inbox for the verification link.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        ...tokens,
      },
    });
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = (req.user as any).userId;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Send response
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  }
);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = (req.user as any).userId;

    const {
      fullName,
      phone,
      city,
      university,
      major,
      graduationYear,
      interests,
      bio,
      linkedInUrl,
      // Company fields
      companyName,
      companyLocation,
      industry,
      description,
    } = req.body;

    // ⚠️ SECURITY: Prevent modification of sensitive fields
    const blockedFields = ['email', 'role', 'isEmailVerified', 'isActive', 'password', 'googleId', 'linkedinId', '_id', 'createdAt', 'updatedAt'];
    const attemptedFields = Object.keys(req.body);
    const forbidden = attemptedFields.filter(field => blockedFields.includes(field));
    
    if (forbidden.length > 0) {
      throw new AppError(`Cannot modify protected fields: ${forbidden.join(', ')}`, 403);
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields if provided
    if (fullName !== undefined) {
      const sanitizedFullName = sanitizeInput(fullName);
      if (!isValidName(sanitizedFullName)) {
        throw new AppError('Full name must be between 2 and 100 characters', 400);
      }
      user.fullName = sanitizedFullName;
    }

    if (phone !== undefined) {
      if (phone && !isValidPhoneNumber(phone)) {
        throw new AppError('Invalid phone number format', 400);
      }
      user.phone = phone;
    }
    
    if (city !== undefined) user.city = sanitizeInput(city);
    if (university !== undefined) user.university = sanitizeInput(university);

    // Student fields (only for student role)
    if (user.role === 'student') {
      if (major !== undefined) user.major = sanitizeInput(major);
      if (graduationYear !== undefined) user.graduationYear = sanitizeInput(graduationYear);
      if (interests !== undefined) {
        // Validate interests array
        if (!Array.isArray(interests)) {
          throw new AppError('Interests must be an array', 400);
        }
        user.interests = interests.map(i => sanitizeInput(i));
      }
      if (bio !== undefined) {
        const sanitizedBio = sanitizeInput(bio);
        if (sanitizedBio.length > MAX_BIO_LENGTH) {
          throw new AppError(
            `Bio cannot exceed ${MAX_BIO_LENGTH} characters`,
            400
          );
        }
        user.bio = sanitizedBio;
      }
      if (linkedInUrl !== undefined) user.linkedInUrl = sanitizeInput(linkedInUrl);
    } else if (user.role === 'company') {
      // Company fields (only for company role)
      if (companyName !== undefined) user.companyName = sanitizeInput(companyName);
      if (companyLocation !== undefined) user.companyLocation = sanitizeInput(companyLocation);
      if (industry !== undefined) user.industry = sanitizeInput(industry);
      if (description !== undefined) {
        const sanitizedDesc = sanitizeInput(description);
        if (sanitizedDesc.length > MAX_DESCRIPTION_LENGTH) {
          throw new AppError(
            `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
            400
          );
        }
        user.description = sanitizedDesc;
      }
    }

    // Mark profile as complete if essential fields are present
    if (user.phone && user.city && user.role) {
      user.isProfileComplete = true;
    }

    // Save updated user
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  }
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userId = (req.user as any).userId;

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    // Validate new password strength
    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message || 'Invalid password', 400);
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);

/**
 * @route   GET /api/auth/google/callback
 * @route   GET /api/auth/linkedin/callback
 * @desc    Handle OAuth callback
 * @access  Public
 */
export const oauthCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as any; // Cast to any or IUser if available

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      return;
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Check if profile is complete
    const isProfileComplete = user.isProfileComplete;

    // Redirect to frontend with tokens
    // In production, use a secure cookie or a temporary code exchange, but for now query params are okay for MVP
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&isProfileComplete=${isProfileComplete}`;

    res.redirect(redirectUrl);
  }
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email with token
 * @access  Public
 */
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    // Find user with this verification token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate tokens for automatic login
    const tokens = generateTokenPair(user);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        user: user.getPublicProfile(),
        ...tokens,
      },
    });
  }
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
export const resendVerification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      throw new AppError('No account found with this email', 404);
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(sanitizedEmail, user.fullName, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new AppError('Failed to send verification email. Please try again later.', 500);
    }

    // Send response
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  }
);
