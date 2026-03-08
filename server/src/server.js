import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.resolve(__dirname, '../..', 'uploads')));

// Friendly root endpoints so opening backend URL doesn't look broken.
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'KXMATERIALS API',
    health: '/api/health',
    routes: ['/api/products', '/api/orders', '/api/users'],
    note: 'Use /api/* routes from frontend. Non-/api aliases are also enabled.'
  });
});
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Primary API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Backward-compatible aliases (helpful when NEXT_PUBLIC_API_URL is missing `/api`)
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

async function connectDBWithRetry() {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failed, retrying in 15s:', error?.message || error);
    setTimeout(connectDBWithRetry, 15000);
  }
}

function registerProcessHandlers() {
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
  });
}

function bootstrap() {
  registerProcessHandlers();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
    connectDBWithRetry();
  });
}

bootstrap();
