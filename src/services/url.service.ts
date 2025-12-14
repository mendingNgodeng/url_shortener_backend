import { prisma } from '../models/prisma';

export class url_shortener_service {
  static async getAll() {
    return prisma.urlShortener.findMany({ include: { user: true } });
  }

  static async getById(id: string) {
    return prisma.urlShortener.findUnique({ where: { id } });
  }

  static async create(input: {
    userId: string;
    clicks: number;
    originalUrl: string;
    shortCode: string;
    expirationDate?: string | null;
  }) {
    return prisma.urlShortener.create({
      data: {
        ...input,
        expirationDate: input.expirationDate
          ? new Date(input.expirationDate)
          : null,
      },
    });
  }

  static async delete(id: string, userId: string) {
    const url = await prisma.urlShortener.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw {
        status: 401,
        message: 'URL tidak ditemukan atau bukan milik user',
      };
    }
    await prisma.history.deleteMany({
      where: { urlId: id },
    });

    // hapus URL milik user
    const deleted = await prisma.urlShortener.deleteMany({
      where: { id, userId },
    });
    return deleted;
  }

  //   for shrotcode validation and others
  static async getByShortCode(shortCode: string) {
    return prisma.urlShortener.findUnique({
      where: { shortCode },
    });
  }

  //   for clicked increment
  static async incrementClicks(id: any) {
    return prisma.urlShortener.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
      },
    });
  }

  // cek owner
  static async isOwner(urlId: string, userId: string) {
    const url = await prisma.urlShortener.findUnique({
      where: { id: urlId },
    });

    if (!url) return null;

    return url.userId === userId;
  }

  static async getByUserId(userId: string) {
    return prisma.urlShortener.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }
}
