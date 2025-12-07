import { Hono } from 'hono';
import urlsRoute from './routes/url.route';
import authRoute from './routes/auth.route';
import history from './routes/history.route';
import users from './routes/user.route';
import { cors } from 'hono/cors';
const app = new Hono();

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

app.use(
  '/*',
  cors({
    origin: '*', // nanti bisa diganti 'http://localhost:5173'
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/urls', urlsRoute);
app.route('/auth', authRoute);
app.route('/history', history);
app.route('/users', users);
export default app;
