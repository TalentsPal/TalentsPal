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
import { mongoSanitize } from './middleware/security';

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

// Body parser with size limits
const BODY_SIZE_LIMIT = '10mb';
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Passport
app.use(passport.initialize());

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API version 1 routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/questions', questionRoutes);

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
  console.error('Shutting down server...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Shutting down server...');
  process.exit(1);
});

export default app;
