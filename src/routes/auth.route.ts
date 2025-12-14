import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const auth = new Hono();

auth.post(
  '/register',
  rateLimit({ windowSec: 60, max: 30, keyPrefix: 'rl:register' }),
  AuthController.register
);

auth.post(
  '/login',
  rateLimit({ windowSec: 60, max: 30, keyPrefix: 'rl:login' }),
  AuthController.login
);

auth.post('/logout', authMiddleware, AuthController.logout);

export default auth;
