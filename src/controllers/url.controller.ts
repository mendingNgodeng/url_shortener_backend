import { url_shortener_service } from '../services/url.service';
import { HistoryService } from '../services/history.service';
import { Context } from 'hono';
import { locationUp } from '../utils/geo';
import { parseUA } from '../utils/ua';
import { urlSchema } from '../validation/url.validation';
// import { containsBlockedKeyword } from '../utils/blocked.keywords';
// import { checkWithGoogleSafeBrowsing } from '../utils/safe.browsing';
import { checkURLSafety } from '../utils/urlSafe';
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

    // Validasi expired default + minimal
    const now = new Date();
    const minimalExpireMs = 3 * 60 * 60 * 1000; // 3 JAM
    const defaultExpireMs = 7 * 24 * 60 * 60 * 1000; // 7 HARI
    // const maxExpireMs = 30 * 24 * 60 * 60 * 1000; // 30 HARI (opsional)
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
    let expirationDate: Date;

    if (!data.expirationDate) {
      // CASE A: USER TIDAK ISI → DEFAULT 7 HARI
      expirationDate = new Date(now.getTime() + defaultExpireMs);
    } else {
      // B: USER MENGISI → NORMALISASI + VALIDASI MINIMAL
      const rawLocal = new Date(data.expirationDate);

      // Koreksi timezone (datetime-local TIDAK punya timezone)
      expirationDate = new Date(
        rawLocal.getTime() - rawLocal.getTimezoneOffset() * 60000
      );

      const minAllowed = new Date(now.getTime() + minimalExpireMs);

      if (expirationDate < minAllowed) {
        return c.json(
          {
            status: 'error',
            message: 'Expired minimal harus 3 jam dari sekarang.',
          },
          400
        );
      }

      // if (containsBlockedKeyword(data.originalUrl)) {
      //   return c.json(
      //     {
      //       status: 'error',
      //       message: 'URL tidak diperbolehkan (mengandung konten terlarang).',
      //     },
      //     400
      //   );
      // }

      // // Google Safe Browsing scan (malware/phishing)
      // const gs = await checkWithGoogleSafeBrowsing(data.originalUrl);

      // if (!gs.safe) {
      //   return c.json(
      //     {
      //       status: 'error',
      //       message: 'Google Safe Browsing mendeteksi URL tidak aman!',
      //       detail: gs.matches,
      //     },
      //     400
      //   );
      // }

      // yes anotehr but with regex on
      const safety = await checkURLSafety(
        data.originalUrl,
        process.env.GOOGLE_API_SAFE_BROWSING
      );

      if (!safety.safe) {
        return c.json(
          {
            status: 'error',
            message: `URL diblokir karena tidak aman:${safety.reason}`,
          },
          400
        );
      }

      // Opsional: validasi maksimal 30 hari
      //   const maxAllowed = new Date(now.getTime() + maxExpireMs);
      //   if (expirationDate > maxAllowed) {
      //     return c.json(
      //       {
      //         status: 'error',
      //         message: 'Expired maksimal hanya 30 hari dari sekarang.',
      //       },
      //       400
      //     );
      //   }
    }

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

    // ambil IP
    let ip =
      c.req.header('x-forwarded-for') ||
      c.req.raw?.headers.get('x-real-ip') ||
      c.req.raw?.headers.get('CF-Connecting-IP') ||
      '8.8.8.8'; // for test
    if (ip.includes(',')) ip = ip.split(',')[0];

    // location geo
    const geo = await locationUp(ip);

    // user agent
    const ua = parseUA(c.req.header('User-Agent') || '');
    // add to history
    await HistoryService.create({
      userId: url.userId,
      urlId: url.id,
      ip,
      userAgent: c.req.header('User-Agent'),
      referer: c.req.header('Referer'),
      country: geo.country,
      city: geo.city,
      device: ua.device ?? 'unknown',
      os: ua.os ?? 'unknown',
      browser: ua.browser ?? 'unknown',
    });
    // redirect to original link
    return c.redirect(url.originalUrl, 302);
  }
}
