import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface ExpressConfig {
  port: number;
  corsOrigin: string;
  logLevel: string;
}

export class ExpressApp {
  private app: Express;
  private config: ExpressConfig;

  constructor(config: ExpressConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup all middlewares
   */
  private setupMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Requested-With']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (this.config.logLevel !== 'none') {
      this.app.use(morgan(this.config.logLevel));
    }

    // Request ID middleware (for tracking)
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      next();
    });

    // Response time middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  /**
   * Setup base routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
      });
    });

    // API base endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
      res.json({
        message: 'AB-EAM API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'AB-EAM Backend API is running!',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api',
          docs: '/api/docs'
        }
      });
    });

    // API routes will be added here
    // this.app.use('/api/users', userRoutes);
    // this.app.use('/api/programs', programRoutes);
    // this.app.use('/api/enrollment-requests', enrollmentRequestRoutes);
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error('Global error handler:', error);

      // Default error response
      const errorResponse: {
        success: boolean;
        error: string;
        code: string;
        timestamp: string;
        path: string;
        method: string;
        stack?: string;
      } = {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      };

      // Add stack trace in development
      if (process.env['NODE_ENV'] === 'development' && error.stack) {
        errorResponse.stack = error.stack;
      }

      res.status(500).json(errorResponse);
    });
  }

  /**
   * Get Express app instance
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * Start the server
   */
  public start(): void {
    this.app.listen(this.config.port, () => {
      console.log(`🚀 Server is running on port ${this.config.port}`);
      console.log(`📊 Health check: http://localhost:${this.config.port}/health`);
      console.log(`🔗 API base: http://localhost:${this.config.port}/api`);
      console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    });
  }
}

// Create and export Express app instance
const port = parseInt(process.env['PORT'] || '3000', 10);
const corsOrigin = process.env['CORS_ORIGIN'] || 'http://localhost:3000';
const logLevel = process.env['LOG_LEVEL'] || 'combined';

export const expressApp = new ExpressApp({
  port,
  corsOrigin,
  logLevel
});

export default expressApp; 