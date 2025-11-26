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
} from '../utils/validation';

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

    // Role-specific validation
    if (role === 'company') {
      if (!companyName || !companyEmail || !companyLocation || !industry) {
        throw new AppError('Please provide all required company fields', 400);
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Prepare user data
    const userData = {
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      password,
      role: role || 'student',
      phone,
      city,
      university: university || undefined,
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

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        ...tokens,
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
      profileImage,
      city,
      university,
      major,
      graduationYear,
      interests,
      role, // Allow setting role if needed
    } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update fields if provided
    if (fullName) {
      const sanitizedFullName = sanitizeInput(fullName);
      if (!isValidName(sanitizedFullName)) {
        throw new AppError('Full name must be between 2 and 100 characters', 400);
      }
      user.fullName = sanitizedFullName;
    }

    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (city !== undefined) user.city = city;
    if (university !== undefined) user.university = university;

    // Update role if it's currently default 'student' and user wants to change (e.g. to company)
    // Or just allow it for now.
    if (role && ['student', 'company'].includes(role)) {
      user.role = role;
    }

    // Student fields
    if (user.role === 'student') {
      if (major !== undefined) user.major = major;
      if (graduationYear !== undefined) user.graduationYear = graduationYear;
      if (interests !== undefined) user.interests = interests;
    } else if (user.role === 'company') {
      // Company fields
      const { companyName, companyLocation, industry, description } = req.body;
      if (companyName !== undefined) user.companyName = companyName;
      if (companyLocation !== undefined) user.companyLocation = companyLocation;
      if (industry !== undefined) user.industry = industry;
      if (description !== undefined) user.description = description;
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
