import * as jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import crypto from "crypto";

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
export const JWT_REFRESH_EXPIRES_IN: string | number =
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
 * - generate 32 random bytes
 * - raw token = hex(randomBytes)
 * - hashed = sha256(raw token) as hex (store in DB)
 */
export function generateRefreshToken(): { raw: string; hashed: string } {
  const buf = crypto.randomBytes(32);
  const raw = buf.toString("hex"); // send to client

  const hashed = crypto.createHash("sha256").update(raw, "utf8").digest("hex"); // store in DB
  return { raw, hashed };
}

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

export interface RefreshTokensResult {
  accessToken: string;
  refreshToken: string;         // raw (send to client) OR "" if not new
  refreshTokenHashed: string;  // store in DB OR "" if not new
  refreshTokenExpiration: Date;
}

/**
 * Generate Token Pair (Access + Refresh)
 * @param user - User document
 * @returns RefreshTokensResult Object
 */
export async function generateTokenPair(
  user: IUser
): Promise<RefreshTokensResult> {
  // Access token always
  let accessToken: string;
  try {
    accessToken = generateAccessToken(user);
  } catch (err) {
    // mimic "internal server error"
    throw new Error(`Failed to generate access token: ${(err as Error).message}`);
  }

  const now = new Date();
  let refreshTokenExpiration: Date;
  try {
    const ms = parseDurationWithDays(JWT_REFRESH_EXPIRES_IN.toString());
    refreshTokenExpiration = new Date(now.getTime() + ms);
  } catch (err) {
    throw new Error(`Invalid refresh duration: ${(err as Error).message}`);
  }

  const { raw, hashed } = generateRefreshToken();

  return {
    accessToken,
    refreshToken: raw,
    refreshTokenHashed: hashed,
    refreshTokenExpiration
  };
};

/**
 * Parse durations like: "15m", "1h", "7d", "30d", "2w"
 */
export function parseDurationWithDays(input: string): number {
  const s = input.trim().toLowerCase();
  const m = s.match(/^(\d+)\s*(ms|s|m|h|d|w)$/);
  if (!m) throw new Error(`Invalid duration: ${input}`);

  const value = Number(m[1]);
  const unit = m[2];

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}