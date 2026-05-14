import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './database.js';
import { seed } from './seed.js';

import productsRouter from './routes/products.js';
import locationsRouter from './routes/locations.js';
import ordersRouter from './routes/orders.js';
import newsletterRouter from './routes/newsletter.js';
import aiRouter from './routes/ai.js';

// Load environment variables from project root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Initialize database and seed data
getDb();
seed();

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  // SPA fallback - all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`☕ Coffee Shop API running on http://localhost:${PORT}`);
  console.log(`   Products:   GET  /api/products`);
  console.log(`   Locations:  GET  /api/locations`);
  console.log(`   Orders:     POST /api/orders`);
  console.log(`   Newsletter: POST /api/newsletter`);
  console.log(`   AI:         POST /api/ai/recommend`);
  console.log(`   Health:     GET  /api/health`);
});
