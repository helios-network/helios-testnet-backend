import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { connect as connectDB } from './config/db';
import userRoutes from './routes/userRoutes';
import xpRoutes from './routes/xpRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import faucetRoutes from './routes/faucetRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import badgeRoutes from './routes/badgeRoutes';
import contributorRoutes from './routes/contributorRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middlewares/errorHandler';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Simple Swagger Setup
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Helios Testnet API',
        version: '1.0.0',
      },
    },
    apis: ['./src/routes/*.ts'], // Path to route files
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/users/xp', xpRoutes); // Merged with user routes for path consistency
app.use('/api/users/onboarding', onboardingRoutes); // Merged with user routes for path consistency
app.use('/api/faucet', faucetRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users/badges', badgeRoutes); // Merged with user routes for path consistency
app.use('/api/users/contributors', contributorRoutes); // Merged with user routes for path consistency
app.use('/api/admin', adminRoutes);
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route for API health check
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Helios Testnet API is running',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(errorHandler);

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});



export default app;