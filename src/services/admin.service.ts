import { prisma } from '../models/prisma';

export class AdminService {
  static async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { urls: true },
        },
      },
    });
  }
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        urls: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
