import { Context } from 'hono';
import { HistoryService } from '../services/history.service';

export class HistoryController {
  static async myHistory(c: Context) {
    const user = c.get('user');
    const id = c.get('userId');
    // console.log(id, user.id);

    const data = await HistoryService.getByUser(id);

    return c.json(data);
  }

  static async all(c: Context) {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ message: 'Forbidden' }, 403);
    }
    const data = await HistoryService.getAll();
    // console.log('HISTORY DATA:', JSON.stringify(data, null, 2));
    return c.json(data);
  }
}
