import { AdminService } from '../services/admin.service';
import { Context } from 'hono';

export class AdminController {
  static async getUsers(c: Context) {
    const users = await AdminService.getUsers();
    return c.json(users);
  }

  static async getUserById(c: Context) {
    const { id } = c.req.param();
    const user = await AdminService.getUserById(id);

    if (!user) return c.json({ error: 'User tidak ditemukan' }, 404);
    return c.json(user);
  }

  static async deleteUser(c: Context) {
    const { id } = c.req.param();
    await AdminService.delete(id);

    return c.json({ message: 'User deleted' });
  }
}
