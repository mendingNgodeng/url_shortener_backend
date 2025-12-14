import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { HistoryController } from '../controllers/history.controller';
import { rateLimit } from '../middleware/rateLimit';

const history = new Hono();

// semua perlu login
history.use('*', authMiddleware);

// Spesific only
history.get(
  '/me',
  rateLimit({ windowSec: 60, max: 50, keyPrefix: 'rl:get:history' }),
  HistoryController.myHistory
);

// Admin only
history.get(
  '/all',
  rateLimit({ windowSec: 60, max: 50, keyPrefix: 'rl:admin:history' }),
  HistoryController.all
);

export default history;
