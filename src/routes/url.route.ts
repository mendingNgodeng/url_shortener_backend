import { Hono } from 'hono';
import { UrlController } from '../controllers/url.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const urls = new Hono();
urls.get('/s/:shortCode', UrlController.redirect_to_original_url);

urls.use('*', authMiddleware);
urls.get('/admin/:id', UrlController.getAllAdmin);
urls.get('/', UrlController.getAll);
urls.get('/:id', UrlController.getById);
urls.post('/', UrlController.create);
urls.delete('/:id', UrlController.delete);

export default urls;
