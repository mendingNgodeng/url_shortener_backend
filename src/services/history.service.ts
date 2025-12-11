import { prisma } from '../models/prisma';

// import { ObjectId } from 'hono/mongodb';

export class HistoryService {
  static async create(input: {
    userId: string;
    urlId: string;
    ip?: string;
    country: string;
    city: string;
    device: string;
    os: string;
    browser: string;
    userAgent?: string;
    referer?: string;
  }) {
    return prisma.history.create({
      data: {
        ...input,
      },
    });
  }

  static async getByUser(userId: string) {
    return prisma.history.findMany({
      where: { userId },
      include: { url: true },
      orderBy: { clickedAt: 'desc' },
    });
  }

  static async getAll() {
    return prisma.history.findMany({
      include: { url: true, user: true },
      orderBy: { clickedAt: 'desc' },
    });
  }
}
