import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * JWT Payload Interface
 */
export interface IJWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT Configuration
 */
const DEFAULT_JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const DEFAULT_ACCESS_TOKEN_EXPIRY = '7d';
const DEFAULT_REFRESH_TOKEN_EXPIRY = '30d';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || DEFAULT_ACCESS_TOKEN_EXPIRY;
const JWT_REFRESH_EXPIRES_IN: string | number =
  process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_TOKEN_EXPIRY;

/**
 * Generate Access Token
 * @param user - User document
 * @returns JWT access token
 */
export const generateAccessToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Generate Refresh Token
 * @param user - User document
 * @returns JWT refresh token
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Verify JWT Token
 * @param token - JWT token to verify
 * @returns Decoded payload or null
 */
export const verifyToken = (token: string): IJWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generate Token Pair (Access + Refresh)
 * @param user - User document
 * @returns Object containing access and refresh tokens
 */
export const generateTokenPair = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
