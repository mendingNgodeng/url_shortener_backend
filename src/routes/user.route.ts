import { Hono } from 'hono';
import user_controller from '../controllers/user.controller';
import {
  authMiddleware,
  requireRole,
  requireSelfOrAdmin,
} from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const users = new Hono();

// ADMIN: lihat semua user
users.get(
  '/',
  rateLimit({ windowSec: 60, max: 60, keyPrefix: 'rl:admin:user' }),
  authMiddleware,
  requireRole('admin'),
  user_controller.list
);

// ADMIN & USER: get user
users.get(
  '/:id',
  rateLimit({ windowSec: 60, max: 50, keyPrefix: 'rl:admin:user' }),
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.get
);

// ADMIN & USER: update profile
users.put(
  '/:id',
  rateLimit({ windowSec: 60, max: 50, keyPrefix: 'rl:update:user' }),
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.updateProfile
);

// ADMIN & USER: update password
users.put(
  '/password/:id',
  rateLimit({ windowSec: 60, max: 50, keyPrefix: 'rl:updatePass:user' }),
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.updatePassword
);

// ADMIN & USER: delete account
users.delete(
  '/:id',
  rateLimit({ windowSec: 60, max: 20, keyPrefix: 'rl:delete:user' }),
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.delete
);

// admin delete account
users.delete(
  '/a/:id',
  rateLimit({ windowSec: 60, max: 20, keyPrefix: 'rl:admin:DelUser' }),
  authMiddleware,
  requireRole('admin'),
  user_controller.delete
);
export default users;
