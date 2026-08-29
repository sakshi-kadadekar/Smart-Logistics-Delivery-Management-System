import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { shipmentsRouter } from './server/routes/shipments';
import { trackingRouter } from './server/routes/tracking';
import { driversRouter } from './server/routes/drivers';
import { warehousesRouter } from './server/routes/warehouses';
import { complaintsRouter } from './server/routes/complaints';
import { pricingRouter } from './server/routes/pricing';
import { paymentsRouter } from './server/routes/payments';
import { analyticsRouter } from './server/routes/analytics';
import { aiRouter } from './server/routes/ai';

dotenv.config();

const app = express();
const PORT = 3000;

// Body Parsers & Middlewares
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Universal CORS & Preflight Handling
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request Logging in Development
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// System Health & Telemetry
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SwiftShip Smart Logistics Backend Engine',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    gemini_ai_ready: Boolean(process.env.GEMINI_API_KEY),
    port: PORT
  });
});

// Mount Modular API Routers
app.use('/api/shipments', shipmentsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Backwards-Compatible Aliases for AI Endpoints
app.use('/api/gemini', aiRouter);

// System Reset & Utility Aliases
app.post('/api/system/reset-demo', (_req: Request, res: Response) => {
  res.redirect(307, '/api/analytics/reset-seed');
});

// 404 handler for API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.path}`
  });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error'
  });
});

// Vite middleware & SPA Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [SwiftShip Server] Ready & Listening on http://0.0.0.0:${PORT}`);
    console.log(`📦 Logistics REST APIs active on /api/*`);
  });
}

startServer();
