import { url_shortener_service } from '../services/url.service';
import { HistoryService } from '../services/history.service';
import { Context } from 'hono';
import { urlSchema } from '../validation/url.validation';

export class UrlController {
  static async getAll(c: Context) {
    const user = c.get('user');

    if (user.role === 'admin') {
      // admin bisa lihat semua
      return c.json(await url_shortener_service.getAll());
    }

    // user biasa hanya bisa lihat punya dia
    return c.json(await url_shortener_service.getByUserId(user.id));
  }

  static async getAllAdmin(c: Context) {
    const user = c.get('user');
    const id = c.get('userId');
    // Admin hanya bisa lihat punya dia
    return c.json(await url_shortener_service.getByUserId(user.id));
  }

  static async getById(c: Context) {
    const { id } = c.req.param();
    const Urls = await url_shortener_service.getById(id);
    if (!Urls) return c.json({ Messgae: 'not found' }, 404);

    return c.json(Urls);
  }

  static async create(c: Context) {
    const body = await c.req.json();

    // validation URL shortener inpuot with zod
    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          status: 'error',
          errors: parsed.error?.flatten().fieldErrors,
        },
        400
      );
    }

    // check unique shortCode
    const data = parsed.data; // to take the shorcode
    const ada = await url_shortener_service.getByShortCode(data.shortCode);
    if (ada) {
      return c.json(
        {
          status: 'error',
          message: 'shortCode sudah terpakai, mohon coba kode lain',
        },
        409
      );
    }

    // 3. Ambil user dari JWT
    const user = c.get('user');

    // 4. Bentuk payload baru
    const payload = {
      userId: user.id, // yes id isi otomatis
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      expirationDate: data.expirationDate ?? null,
      clicks: 0,
    };

    // 5. Simpan ke database
    const created = await url_shortener_service.create(payload);
    return c.json(created, 201);
  }

  static async delete(c: Context) {
    const { id } = c.req.param();
    const user = c.get('user'); // ambil user dari Bearer token

    const deleted = await url_shortener_service.delete(id, user.id);

    if (deleted.count === 0) {
      return c.json(
        { message: 'Tidak boleh menghapus URL milik user lain' },
        403
      );
    }
    return c.json({ message: 'URL deleted' });
  }

  static async redirect_to_original_url(c: Context) {
    const { shortCode } = c.req.param();

    // look data by shortcode
    const url = await url_shortener_service.getByShortCode(shortCode);

    if (!url) {
      return c.json({ message: 'Shortcode tidak ditemukan' }, 404);
    }

    // check if expired
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      return c.json({ message: 'Url ini sudah expired' }, 410);
    }

    // add clicks
    await url_shortener_service.incrementClicks(url.id);

    // add to history
    await HistoryService.create({
      userId: url.userId,
      urlId: url.id,
      ip:
        c.req.header('x-forwarded-for') ||
        c.req.raw?.headers.get('x-real-ip') ||
        'unknown',
      userAgent: c.req.header('User-Agent') || 'unknown',
    });
    // redirect to original link
    return c.redirect(url.originalUrl, 302);
  }
}
