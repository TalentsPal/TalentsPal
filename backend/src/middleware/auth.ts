import { Request, Response, NextFunction } from 'express';
import { verifyToken, IJWTPayload } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import User from '../models/User';
import { cacheGetJSON, cacheSetJSON } from '../utils/redisCache';

const AUTH_TTL_SECONDS = 600;

/**
 * Authentication Middleware - Verify JWT Token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please authenticate.', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Check if user still exists and is active
    // 1) try cache
    const key = `auth:${decoded.userId}`;
    const cached = await cacheGetJSON<{ isActive: boolean }>(key);

    if (cached) {
      console.log("user's authentication check found in cache ✅");
      if (!cached.isActive) throw new AppError("User account is deactivated", 401);
      req.user = decoded;
      return next();
    }

    // 2) cache miss -> DB
    console.log("user's authentication check not found in cache ❌");
    console.log("getting authentication check from DB...");
    const user = await User.findOne(
      {_id: decoded.userId},
      {_id: 1, isActive: 1}
    ).lean();
    
    if (!user) throw new AppError("User no longer exists", 401);
    if (!user.isActive) throw new AppError("User account is deactivated", 401);

    // 3) cache it
    void cacheSetJSON(key, { isActive: user.isActive }, AUTH_TTL_SECONDS); // 10 min
    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization Middleware - Check User Role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!roles.includes((req.user as any).role)) {
        throw new AppError(
          'You do not have permission to perform this action',
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional Authentication - Attach user if token exists
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
