import { Hono } from 'hono';
import { UrlController } from '../controllers/url.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const urls = new Hono();
urls.get(
  '/s/:shortCode',
  rateLimit({ windowSec: 60, max: 60, keyPrefix: 'rl:redirect' }),
  UrlController.redirect_to_original_url
);

urls.use('*', authMiddleware);
urls.get(
  '/admin/:id',
  rateLimit({ windowSec: 60, max: 60, keyPrefix: 'rl:admin:url' }),
  UrlController.getAllAdmin
);

urls.get(
  '/',
  rateLimit({ windowSec: 60, max: 30, keyPrefix: 'rl:get:urls' }),
  UrlController.getAll
);
urls.get(
  '/:id',
  rateLimit({ windowSec: 60, max: 60, keyPrefix: 'rl:get:url' }),
  UrlController.getById
);
urls.post(
  '/',
  rateLimit({ windowSec: 60, max: 10, keyPrefix: 'rl:create:url' }),
  UrlController.create
);
urls.delete(
  '/:id',
  rateLimit({ windowSec: 60, max: 10, keyPrefix: 'rl:delete:url' }),
  UrlController.delete
);

export default urls;
