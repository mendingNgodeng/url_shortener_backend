import { prisma } from '../models/prisma';
import { hashPassword } from '../utils/hash';
import bycrypt from 'bcryptjs';

export const userService = {
  async getAllUsers(user_id: string) {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { urls: true } },
      },
      where: { id: { not: user_id } },
    });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        // urls: true,
        _count: { select: { urls: true } },
      },
    });
  },

  async updateProfile(id: string, data: any) {
    // Cek apakah email sudah digunakan user lain
    if (data.email) {
      const existsEmail = await prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
      });

      if (existsEmail) {
        throw new Error('Email sudah digunakan.');
      }
    }

    // Cek apakah username sudah digunakan user lain
    if (data.username) {
      const existsUsername = await prisma.user.findFirst({
        where: { username: data.username, id: { not: id } },
      });

      if (existsUsername) {
        throw new Error('Username sudah digunakan.');
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
      },
    });
  },

  async updatePassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    const hashed = await hashPassword(newPassword);
    return prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  },

  // delete all data related to user
  // async deleteUser(id: string) {
  //   return prisma.user.delete({
  //     where: { id },
  //   });
  // },
  // async deleteHistory(id: string) {
  //   return prisma.history.deleteMany({
  //     where: { userId: id },
  //   });
  // },
  // async deleteUrls(id: string) {
  //   return prisma.urlShortener.deleteMany({
  //     where: { userId: id },
  //   });
  // },

  async deleteUser(id: string) {
    //  Ambil semua URL milik user
    const urls = await prisma.urlShortener.findMany({
      where: { userId: id },
      select: { id: true },
    });

    const urlIds = urls.map((u) => u.id); //this is so user can be deleted when theyt still have URLS

    //  Hapus semua history berdasarkan URL id
    await prisma.history.deleteMany({
      where: { urlId: { in: urlIds } },
    });

    //  Hapus semua URL milik user
    await prisma.urlShortener.deleteMany({
      where: { userId: id },
    });

    //  hapus user
    return prisma.user.delete({
      where: { id },
    });
  },
};
