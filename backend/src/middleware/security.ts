import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

/**
 * Simple In-Memory Rate Limiter
 * Note: For production with multiple instances, use Redis.
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiter constants
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;

export const rateLimiter = (
  windowMs: number = DEFAULT_WINDOW_MS,
  max: number = DEFAULT_MAX_REQUESTS
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip);

    if (!record) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      return next(new AppError('Too many requests from this IP, please try again later.', 429));
    }

    record.count++;
    next();
  };
};

/**
 * MongoDB Sanitize Middleware
 * Prevents NoSQL injection by removing keys starting with '$'
 */
const sanitizeObject = (obj: any): any => {
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (key.startsWith('$')) {
        // Remove keys starting with $
        return acc;
      }
      acc[key] = sanitizeObject(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

export const mongoSanitize = (req: Request, res: Response, next: NextFunction) => {
  req.body = sanitizeObject(req.body);
  
  // Can't reassign req.query directly (it's a getter), so replace its properties
  const sanitizedQuery = sanitizeObject(req.query);
  Object.keys(req.query).forEach(key => delete req.query[key]);
  Object.assign(req.query, sanitizedQuery);
  
  req.params = sanitizeObject(req.params);
  next();
};

/**
 * XSS Sanitize Middleware
 * Basic XSS protection by escaping HTML characters
 */
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const xssSanitizeObject = (obj: any): any => {
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(xssSanitizeObject);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = xssSanitizeObject(obj[key]);
      return acc;
    }, {} as any);
  }
  if (typeof obj === 'string') {
    return escapeHtml(obj);
  }
  return obj;
};

export const xssSanitize = (req: Request, res: Response, next: NextFunction) => {
  // Only sanitize body, as params and query might need original values for lookups
  // But for high security, we should sanitize everything and handle decoding where needed.
  // For now, let's sanitize body strings.
  if (req.body) {
    req.body = xssSanitizeObject(req.body);
  }
  next();
};

/**
 * HTTP Parameter Pollution (HPP) Middleware
 * Prevents parameter pollution by converting array query parameters to strings (taking the last value)
 * unless whitelisted.
 */
export const hpp = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        // If key is not in whitelist and value is an array, take the last value
        if (!whitelist.includes(key) && Array.isArray(req.query[key])) {
          const values = req.query[key] as any[];
          req.query[key] = values[values.length - 1];
        }
      });
    }
    next();
  };
};
