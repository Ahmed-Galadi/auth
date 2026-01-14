import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface RefreshPayload {
  sub: number;
  email: string;
  role: string;
  name?: string;
}

const extractToken = (req: Request): string | null => {
  const header = req.get('authorization');
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }
  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractToken]),
      secretOrKey:
        configService.get<string>('REFRESH_SECRET') ||
        configService.get<string>('BACKEND_REFRESH_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        configService.get<string>('BACKEND_JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshPayload) {
    const refreshToken = extractToken(req);
    return { userId: payload.sub, email: payload.email, role: payload.role, name: payload.name, refreshToken };
  }
}
