import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'https://frontend-delta-mocha-nx53nc3jof.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Fallback: in development or when wildcards used
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    name: 'People Voice API',
    tagline: 'Voice-Powered Inventory Management for Small Businesses',
    status: 'Running',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
