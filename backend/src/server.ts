import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables FIRST - before any other imports
dotenv.config();

import passport from 'passport';
import connectDB from './config/db';
import { errorHandler } from './utils/errorHandler';
import './config/passport'; // Initialize passport strategies
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import metadataRoutes from './routes/metadataRoutes';
import questionRoutes from './routes/questionRoutes';
import achievementRoutes from './routes/achievementRoutes';
import challengeRoutes from './routes/challengeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import practiceRoutes from './routes/practiceRoutes';
import { mongoSanitize } from './middleware/security';
import { compressionMiddleware, cacheControl, requestId, healthCheck } from './middleware/production';
import cookieParser from "cookie-parser";

// Initialize Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

/**
 * Middleware Configuration
 */

// Security constants
const HSTS_MAX_AGE = 31536000; // 1 year in seconds

// 🔒 Enhanced Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: HSTS_MAX_AGE,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// 🔒 Strict CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
];

const CORS_MAX_AGE = 86400; // 24 hours in seconds

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: CORS_MAX_AGE,
  })
);

// 🔒 MongoDB NoSQL Injection Protection
app.use(mongoSanitize);

// 🚀 Production Optimizations
if (process.env.NODE_ENV === 'production') {
  app.use(compressionMiddleware); // GZIP compression
  app.use(cacheControl); // Cache control headers
}
app.use(requestId); // Request tracking

app.use(cookieParser());

// Body parser with size limits
const BODY_SIZE_LIMIT = '10mb';
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: log only errors and important requests
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Initialize Passport
app.use(passport.initialize());

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', healthCheck);

// API version 1 routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/practice', practiceRoutes);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 TalentsPal Backend Server                       ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port: ${PORT}                                          ║
║   Status: ✅ Running                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // In production, log to monitoring service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service
    console.error('Shutting down gracefully...');
    process.exit(1);
  } else {
    console.error('Shutting down server...');
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // In production, log to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service
    console.error('Shutting down gracefully...');
    process.exit(1);
  } else {
    console.error('Shutting down server...');
    process.exit(1);
  }
});

export default app;
 
