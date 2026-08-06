import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// TODO: API routes go here

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
