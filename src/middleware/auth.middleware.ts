import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header('Authorization');

  if (!auth) return c.json({ error: 'Token tidak ada' }, 401);

  const token = auth.replace('Bearer ', '');

  try {
    const decoded = await verifyToken(token);
    c.set('user', decoded);
    c.set('userId', decoded.id); // for easy access
    // bruhhhh admin get admin? what in the fu-
    // console.log('JWT USER:', c.get('user'));
    await next();
  } catch (e) {
    return c.json({ error: 'token invalid' }, 401);
  }
};

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || user.role !== role) {
      return c.json({ error: 'Tidak punya akses' }, 403);
    }

    await next();
  };
};

// ownership
export const requireSelfOrAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');
  const targetId = c.req.param('id');

  // admin = lolos
  if (user.role === 'admin') return next();

  // user biasa = hanya boleh akses dirinya
  if (user.id !== targetId) {
    return c.json({ error: 'Tidak boleh akses user lain' }, 403);
  }

  await next();
};
