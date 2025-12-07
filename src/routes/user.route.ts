import { Hono } from 'hono';
import user_controller from '../controllers/user.controller';
import {
  authMiddleware,
  requireRole,
  requireSelfOrAdmin,
} from '../middleware/auth.middleware';

const users = new Hono();

// ADMIN: lihat semua user
users.get('/', authMiddleware, requireRole('admin'), user_controller.list);

// ADMIN & USER: get user
users.get('/:id', authMiddleware, requireSelfOrAdmin, user_controller.get);

// ADMIN & USER: update profile
users.put(
  '/:id',
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.updateProfile
);

// ADMIN & USER: update password
users.put(
  '/password/:id',
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.updatePassword
);

// ADMIN & USER: delete account
users.delete(
  '/:id',
  authMiddleware,
  requireSelfOrAdmin,
  user_controller.delete
);

export default users;
