import { Request, Response, NextFunction } from 'express';
import User, { COMPANY_ROLE, STUDENT_ROLE, VALID_ROLES } from '../models/User';
import { generateAccessToken, generateRefreshToken, generateTokenPair, JWT_REFRESH_EXPIRES_IN, parseDurationWithDays } from '../utils/jwt';
import { AppError, asyncHandler } from '../utils/errorHandler';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  sanitizeInput,
  isValidRole,
  isValidPhoneNumber,
  isValidCity,
  sanitizeSignupRequest,
  ensureEmailIsNotFound,
  isValidUniversity,
  isValidMajor,
  isValidYear,
  validateInterests,
  sanitizeUpdateProfileRequest,
  isProfileComplete,
} from '../utils/validation';
import {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email';
import bcrypt from 'bcrypt';
import crypto from "crypto";
import { cacheGetJSON, cacheSetJSON, cacheDel, meKey, authKey } from "../utils/redisCache";

const ME_TTL_SECONDS = 60; // start with 60s (safe) then tune

// Constants
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const MAX_BIO_LENGTH = 500;
// const MAX_DESCRIPTION_LENGTH = 1000;
const SALT_ROUNDS = 12;

/**
 * DONE
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Sanitize inputs first (mutates req.body in place)
    sanitizeSignupRequest(req.body);

    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      countryCode,
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
    if (!fullName || !email || !password || !confirmPassword || !countryCode || !phone || !city) {
      throw new AppError('Please provide all required fields: fullName, email, password, confirmPassword, countryCode, phone, city', 400);
    }

    // Set default role if not provided
    const userRole = role || 'student';

    // Validate email
    if (!isValidEmail(email)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    const checks = await Promise.all([
      isValidCity(city),
      userRole === VALID_ROLES[STUDENT_ROLE] && university ? isValidUniversity(university) : Promise.resolve({ valid: true, message: "" }),
      userRole === VALID_ROLES[STUDENT_ROLE] && major ? isValidMajor(major) : Promise.resolve({ valid: true, message: "" }),
    ]);

    const [cityValidation, universityValidation, majorValidation] = checks;

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message || 'Invalid password', 400);
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Validate role if provided
    if (userRole && !isValidRole(userRole)) {
      throw new AppError('Invalid role specified', 400);
    }

    const phoneNumberValidation = isValidPhoneNumber(phone, countryCode);
    // Validate phone number with country code
    if (!phoneNumberValidation.valid) {
      throw new AppError(phoneNumberValidation.message || 'Invalid phone number format', 400);
    }

    // Validate city
    if (!cityValidation.valid) {
      throw new AppError(cityValidation.message || 'This city is not supported yet', 404);
    }

    if (userRole == VALID_ROLES[STUDENT_ROLE]) {
      // Validate university
      if (university) {
        // const universityValidation = await isValidUniversity(university);
        if (!universityValidation.valid) {
          throw new AppError(universityValidation.message || 'This university is not supported yet', 404);
        }
      }

      // Validate major
      if (major) {
        if (!majorValidation.valid) {
          throw new AppError(majorValidation.message || 'This major is not supported yet', 404);
        }
      }

      // Validate graduation year
      if (graduationYear) {
        const graduationYearValidation = isValidYear(graduationYear);
        if (!graduationYearValidation.valid) {
          throw new AppError(graduationYearValidation.message || 'Invalid graduation year', 400);
        }
      }

      // Validate interests
      if (interests && Array.isArray(interests) && interests.length !== 0) {
        const interestsValidation = validateInterests(interests);
        if (!interestsValidation.valid) {
          throw new AppError(interestsValidation.message || 'Invalid interests', 400);
        }
        // Update interests to unique values
        req.body.interests = interestsValidation.uniqueInterests;
      }
    }

    // Block company registration
    if (userRole === VALID_ROLES[COMPANY_ROLE]) {
      throw new AppError('Company registration is currently disabled', 403);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Prepare user data
    const userData = {
      fullName,
      email,
      password: hashedPassword,
      role: userRole,
      phone,
      city,
      university: university || undefined,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      // Add student-specific fields
      ...(userRole === 'student' && {
        linkedInUrl: linkedInUrl || undefined,
        major: major || undefined,
        graduationYear: graduationYear || undefined,
        interests: req.body.interests || [],
      }),
      // Add company-specific fields
      ...(userRole === 'company' && {
        companyName,
        companyEmail,
        companyLocation,
        industry,
        description: description || undefined,
      }),
    };

    // Create new user
    let user;
    try {
      user = await User.create(userData);
    } catch (err: any) {
      if (err?.code === 11000 && err?.keyPattern?.email) {
        throw new AppError("An account with this email already found", 409);
      }
      throw err;
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

    setImmediate(async () => {
      // Send verification email
      try {
        await Promise.race([
          sendVerificationEmail(email, fullName, verificationToken),
          new Promise((_, rej) => setTimeout(() => rej(new Error("Email timeout")), 8000)),
        ]);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Don't fail the signup if email fails, but log it
      }
    });

    return;
  }
);

/**
 * DONE
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
    const tokensGenerator = await generateTokenPair(user);

    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: tokensGenerator.refreshTokenHashed, refreshTokenExp: tokensGenerator.refreshTokenExpiration } }
    );

    // send RAW token in cookie
    const ms = parseDurationWithDays(String(JWT_REFRESH_EXPIRES_IN));

    res.cookie("refreshToken", tokensGenerator.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/auth/refresh",
      maxAge: ms,
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokensGenerator.accessToken,
      },
    });
  }
);

/**
 * DONE
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

    // 1) Try cache
    const key = meKey(userId);
    const cached = await cacheGetJSON<any>(key);
    if (cached) {
      console.log("user's profile found in cache ✅");
      res.status(200).json({ success: true, data: { user: cached }, cached: true });
      return;
    }

    // 2) Get from DB
    console.log("user's profile not found in cache ❌");
    console.log("getting user's profile from DB...");
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userProfile = user.getPublicProfile();

    // 3) Send response
    res.status(200).json({
      success: true,
      data: {
        user: userProfile,
      },
    });

    // 4) Save to cache
    void cacheSetJSON(key, userProfile, ME_TTL_SECONDS);
  }
);

/**
 * DONE
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

    sanitizeUpdateProfileRequest(req.body);

    const {
      fullName,
      countryCode,
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
    const blockedFields = ['email', 'companyEmail', 'role', 'isEmailVerified', 'isProfileComplete', 'isActive', 'password', 'profileImage', 'emailVerificationToken', 'emailVerificationExpires', 'googleId', 'linkedinId', '_id', 'refreshToken', 'refreshTokenExp', 'createdAt', 'updatedAt'];
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

    console.log(req.body);

    // Update fields if provided
    if (fullName !== undefined && fullName !== '' && fullName !== null) {
      const validateName = isValidName(fullName);
      if (!validateName.valid) {
        throw new AppError(validateName.message, 400);
      }
      user.fullName = fullName;
    }

    // Validate phone number with country code if provided
    if ((phone !== undefined && phone !== '' && phone !== null) && (countryCode !== undefined && countryCode !== '' && countryCode !== null)) {
      if (phone && countryCode) {
        const phoneNumberValidation = isValidPhoneNumber(phone, countryCode);
        if (!phoneNumberValidation.valid) {
          throw new AppError(phoneNumberValidation.message || 'Invalid phone number format', 400);
        }
        user.phone = phone;
      }
    }

    const checks = await Promise.all([
      (city !== undefined && city !== '' && city !== null) ? isValidCity(city) : Promise.resolve({ valid: true, message: "" }),
      user.role === VALID_ROLES[STUDENT_ROLE] && (university !== undefined && university !== '' && university !== null) ? isValidUniversity(university) : Promise.resolve({ valid: true, message: "" }),
      user.role === VALID_ROLES[STUDENT_ROLE] && (major !== undefined && major !== '' && major !== null) ? isValidMajor(major) : Promise.resolve({ valid: true, message: "" }),
    ]);

    const [cityValidation, universityValidation, majorValidation] = checks;

    if (city !== undefined && city !== '' && city !== null) {
      if (!cityValidation.valid) {
        throw new AppError(cityValidation.message || 'This city is not supported yet', 404);
      }
      user.city = city;
    }

    // Student fields (only for student role)
    if (user.role === VALID_ROLES[STUDENT_ROLE]) {
      if (university !== undefined && university !== '' && university !== null) {
        if (!universityValidation.valid) {
          throw new AppError(universityValidation.message || 'This university is not supported yet', 404);
        }
        user.university = university;
      }

      if (major !== undefined && major !== '' && major !== null) {
        if (!majorValidation.valid) {
          throw new AppError(majorValidation.message || 'This major is not supported yet', 404);
        }
        user.major = major;
      }

      if (graduationYear !== undefined && graduationYear !== '' && graduationYear !== null) {
        const graduationYearValidation = isValidYear(graduationYear);
        if (!graduationYearValidation.valid) {
          throw new AppError(graduationYearValidation.message || 'Invalid graduation year', 400);
        }
        user.graduationYear = graduationYear;
      }

      if ((interests !== undefined && interests !== null) && Array.isArray(interests) && interests.length !== 0) {
        const interestsValidation = validateInterests(interests);
        if (!interestsValidation.valid) {
          throw new AppError(interestsValidation.message || 'Invalid interests', 400);
        }
        // Update interests to unique values
        user.interests = interestsValidation.uniqueInterests;
      }

      if (bio !== undefined && bio !== '' && bio !== null) {
        if (bio.length > MAX_BIO_LENGTH) {
          throw new AppError(
            `Bio cannot exceed ${MAX_BIO_LENGTH} characters`,
            400
          );
        }
        user.bio = bio;
      }

      if (linkedInUrl !== undefined && linkedInUrl !== '' && linkedInUrl !== null) {
        user.linkedInUrl = linkedInUrl;
      }
    } else if (user.role === VALID_ROLES[COMPANY_ROLE]) {
      // Company fields (only for company role)
      throw new AppError('Company role is currently disabled', 403);
    }

    // Mark profile as complete if all fields are present
    user.isProfileComplete = isProfileComplete(user);

    // user.updatedAt field is updated automatically
    // Save updated user
    await user.save();

    // invalidate user's profile in cache
    await cacheDel(meKey(userId));

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

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('Please provide all required fields (current and new passwords and the confirm)', 400);
    }

    if (newPassword != confirmPassword) {
      throw new AppError('New and Confirm Passwords do not match', 400);
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

    if (newPassword == currentPassword) {
      throw new AppError('You already have the same password', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    user.password = hashedPassword;
    user.refreshToken = undefined;
    user.refreshTokenExp = undefined;
    await user.save();

    // invalidate user's profile in cache
    await Promise.all([
      cacheDel(meKey(userId)),
      cacheDel(authKey(userId)),
    ]);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);

/**
 * DONE
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
    const tokensGenerator = await generateTokenPair(user);

    user.refreshToken = tokensGenerator.refreshTokenHashed;
    user.refreshTokenExp = tokensGenerator.refreshTokenExpiration;
    await user.save();

    const ms = parseDurationWithDays(String(JWT_REFRESH_EXPIRES_IN));

    res.cookie("refreshToken", tokensGenerator.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/auth/refresh",
      maxAge: ms,
    });


    const params = new URLSearchParams({
      token: tokensGenerator.accessToken,
      isProfileComplete: String(user.isProfileComplete),
    });

    // Redirect to frontend with tokens
    // In production, use a secure cookie or a temporary code exchange, but for now query params are okay for MVP
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?${params.toString()}`;

    res.redirect(redirectUrl);
  }
);

/**
 * DONE
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
    }).select('+emailVerificationToken +emailVerificationExpires +isActive');

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // Generate tokens for automatic login
    const tokensGenerator = await generateTokenPair(user);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          refreshToken: tokensGenerator.refreshTokenHashed,
          refreshTokenExp: tokensGenerator.refreshTokenExpiration,
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
        },
      }
    );

    // send RAW token in cookie
    const ms = parseDurationWithDays(String(JWT_REFRESH_EXPIRES_IN));

    res.cookie("refreshToken", tokensGenerator.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/auth/refresh",
      maxAge: ms,
    });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokensGenerator.accessToken,
      },
    });
  }
);

/**
 * Done
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

    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );


    // Find user and update him 
    const user = await User.findOneAndUpdate(
      { email: sanitizedEmail, isEmailVerified: false },
      { $set: { emailVerificationToken: verificationToken, emailVerificationExpires: verificationExpires } },
      { new: true, projection: { fullName: 1 } }
    ).lean();

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.',
    });

    if (!user) {
      return;
    }

    // Send verification email - fire-and-forget
    sendVerificationEmail(sanitizedEmail, user.fullName, verificationToken)
      .catch(async () => {
        await User.updateOne(
          { email: sanitizedEmail },
          {
            $unset: {
              emailVerificationToken: 1,
              emailVerificationExpires: 1,
            },
          }
        );
      });
  }
);

const sha256hex = (raw: string) =>
  crypto.createHash("sha256").update(raw, "utf8").digest("hex");

/**
 * DONE
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  console.log(refreshToken);

  if (!refreshToken || typeof refreshToken !== "string") {
    throw new AppError("Refresh token is required", 401);
  }

  const refreshTokenHashed = sha256hex(refreshToken);

  // Find user by hashed refresh token
  const user = await User.findOne({ refreshToken: refreshTokenHashed }).select('+refreshToken +refreshTokenExp');

  if (!user) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (!user.refreshTokenExp || user.refreshTokenExp.getTime() < Date.now()) {
    throw new AppError("Refresh token expired. Please login again.", 401);
  }

  // Issue new access token & rotate refresh token (stronger security)
  const tokensGenerator = await generateTokenPair(user);

  user.refreshToken = tokensGenerator.refreshTokenHashed;
  user.refreshTokenExp = tokensGenerator.refreshTokenExpiration;
  await user.save();

  // send RAW token in cookie
  const ms = parseDurationWithDays(String(JWT_REFRESH_EXPIRES_IN));

  res.cookie("refreshToken", tokensGenerator.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh",
    maxAge: ms,
  });

  res.status(200).json({
    success: true,
    data: { accessToken: tokensGenerator.accessToken },
  });
});

/**
 * DONE
 * @route   POST /api/auth/logout
 * @desc    loguot clears refresh token info
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const hashed = sha256hex(refreshToken);
    await User.updateOne(
      { refreshToken: hashed },
      { $set: { refreshToken: null, refreshTokenExp: null } }
    );
  }

  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ success: true, message: "Logged out" });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Please provide your email address', 400);
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // We'll manualy handle it here since we didn't add the method to the model yet or we can just do it here
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save({ validateBeforeSave: false });


    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });

    // Send password reset email - fire-and-forget
    sendPasswordResetEmail(user.email, user.fullName, resetToken)
      .catch(async () => {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
      });
  }
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      throw new AppError('Please provide password and confirmPassword', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message || 'Invalid password', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear refresh token to force re-login on all devices
    user.refreshToken = undefined;
    user.refreshTokenExp = undefined;

    await user.save();

    // 3) Log the user in, send JWT
    // Actually, usually we just send success and make them login
    // But we can also log them in directly. Let's just send success 
    // as per typical security practices to verify they know the new password.

    res.status(200).json({
      success: true,
      message: 'Password reset successful! Please log in with your new password.',
    });

    // invalidate user's profile in cache
    const userId = user._id.toString();

    Promise.all([
      cacheDel(meKey(userId)),
      cacheDel(authKey(userId)),
    ]);
  }
);


