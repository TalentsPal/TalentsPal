import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

/**
 * Enable GZIP compression for responses
 * Compresses response bodies for all requests
 */
export const compressionMiddleware = compression({
  // Compress all responses by default
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (0-9, where 6 is default balance)
  level: 6,
  // Minimum size to compress (in bytes)
  threshold: 1024, // 1KB
});

/**
 * Add cache control headers for static assets
 */
export const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Cache static files for 1 year
  if (req.url.match(/\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Don't cache API responses
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
};

/**
 * Request ID middleware for tracking
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = Math.random().toString(36).substring(7);
  res.setHeader('X-Request-Id', id);
  (req as any).id = id;
  next();
};

/**
 * Production health check endpoint
 */
export const healthCheck = (req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'ERROR';
    res.status(503).json(healthcheck);
  }
};
