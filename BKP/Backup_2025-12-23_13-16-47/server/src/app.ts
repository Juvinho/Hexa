import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import leadRoutes from './routes/lead.routes';
import aiRoutes from './routes/ai.routes';
import { apiLimiter } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrf';
import { trafficLogger } from './middleware/trafficLogger';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Must be specific for credentials
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Traffic Logging
app.use(trafficLogger);

// CSRF Protection
app.use(csrfProtection);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Dashboard Routes
app.use('/api', dashboardRoutes);

// Lead Routes
app.use('/api/leads', leadRoutes);

// AI Routes
app.use('/api/ai', aiRoutes);

export default app;
