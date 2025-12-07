import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { HistoryController } from '../controllers/history.controller';

const history = new Hono();

// semua perlu login
history.use('*', authMiddleware);

// Spesific only
history.get('/me', HistoryController.myHistory);

// Admin only
history.get('/all', HistoryController.all);

export default history;
