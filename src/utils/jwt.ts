import { sign, verify } from 'hono/jwt';

const secret = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';

export const generateToken = async (
  payload: any,
  expiredIn: number = 60 * 60
) => {
  const exp = Math.floor(Date.now() / 1000) + expiredIn;
  return await sign({ ...payload, exp }, secret);
};

export const verifyToken = async (token: string) => {
  return await verify(token, secret);
};
