import { Context } from 'hono';
import { userService } from '../services/user.service';
import { updateProfile, updatePass } from '../validation/user.validation';

export default class user_controller {
  static async list(c: Context) {
    const id = c.get('userId');
    const users = await userService.getAllUsers(id);
    return c.json(users);
  }

  static async get(c: Context) {
    const { id } = c.req.param();
    const user = await userService.getUserById(id);

    if (!user) return c.json({ error: 'User tidak ditemukan' }, 404);
    return c.json(user);
  }

  static async updateProfile(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json();

    const parsed = updateProfile.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          errors: parsed.error.flatten().fieldErrors, // <= konsisten
        },
        400
      );
    }
    try {
      const updated = await userService.updateProfile(userId, parsed.data);
      return c.json({ message: 'Profile updated', data: updated });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }

  static async updatePassword(c: Context) {
    const id = c.get('userId');
    const body = await c.req.json();
    // console.log('USER ID YANG MASUK:', id);
    const parsed = updatePass.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    try {
      await userService.updatePassword(id, parsed.data.password);
      return c.json({ message: 'Password updated' });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }

  static async delete(c: Context) {
    const { id } = c.req.param();

    await userService.deleteUser(id);

    return c.json({ message: 'User berhasil dihapus' });
  }

  static async deleteUserByAdmin(c: Context) {
    const { id } = c.req.param();

    if (!id) {
      return c.json({ error: 'ID user tidak diberikan' }, 400);
    }

    return c.json({ message: 'User berhasil dihapus' });
  }
}
