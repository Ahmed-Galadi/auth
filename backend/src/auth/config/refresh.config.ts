import { registerAs } from '@nestjs/config';

export default registerAs('refresh', () => ({
  secret: process.env.REFRESH_SECRET,
  expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
}));
