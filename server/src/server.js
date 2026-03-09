import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js';
import { getProductById, getProducts } from './controllers/productController.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { uploadsDir } from './config/uploads.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadsDir));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'KXMATERIALS API',
    health: '/api/health',
    routes: ['/api/products', '/api/orders', '/api/users'],
    note: 'Use /api/* routes from frontend. Non-/api aliases are also enabled.'
  });
});

// Friendly /api index so opening the API base URL does not return Route not found.
app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    message: 'KXMATERIALS API base endpoint',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users'
    }
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Explicit public aliases to avoid accidental 401 confusion on `/products` URLs.
app.get('/products', getProducts);
app.get('/products/:id', getProductById);

// Backward-compatible full product aliases (including POST /products for admin add flow).
app.use('/products', productRoutes);

// Primary API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);

// Backward-compatible aliases (helpful when NEXT_PUBLIC_API_URL is missing `/api`)
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/contact', contactRoutes);

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


function startSelfPing() {
  const enabled = (process.env.ENABLE_SELF_PING || 'true').toLowerCase() === 'true';
  if (!enabled) return;

  const intervalMs = Number(process.env.SELF_PING_INTERVAL_MS || 12 * 60 * 1000);
  const baseUrl = process.env.SELF_PING_URL || `http://127.0.0.1:${PORT}/api/health`;

  const ping = async () => {
    try {
      await fetch(baseUrl, { method: 'GET' });
    } catch (error) {
      console.warn('Self-ping failed:', error?.message || error);
    }
  };

  ping();
  setInterval(ping, intervalMs);
  console.log(`Self-ping enabled: ${baseUrl} every ${Math.round(intervalMs / 1000)}s`);
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
    startSelfPing();
  });
}

bootstrap();
