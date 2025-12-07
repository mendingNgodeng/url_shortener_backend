import { prisma } from '../models/prisma';
import bcrypt from 'bcryptjs';
import { Context } from 'hono';
import { generateToken } from '../utils/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';

export class AuthService {
  static async register(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const { username, password, role, email } = data;

    // cek unique username and email
    const exist_username = await prisma.user.findUnique({
      where: { username },
    });
    const exist_email = await prisma.user.findUnique({
      where: { email },
    });

    if (exist_username) throw new Error('username sudah dipakai');
    if (exist_email) throw new Error('email sudah dipakai');

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role: role || 'user',
      },
    });
    return user;
  }

  static async login(data: {
    identifier: string; // username atau email
    password: string;
    // c: Context;
  }) {
    const { identifier, password } = data;

    // cari user by username ATAU email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) throw new Error('User tidak ditemukan');

    // cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Password salah');

    // token
    const token = await generateToken(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      60 * 60 // expired in 1 hour
    );

    return { user, token };
  }
}
