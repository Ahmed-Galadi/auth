import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  name?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async generateTokens(payload: JwtPayload) {
    const accessSecret =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('BACKEND_JWT_SECRET');
    const accessExpires =
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      this.configService.get<string>('BACKEND_JWT_EXPIRES_IN') ||
      '15m';

    const refreshSecret =
      this.configService.get<string>('REFRESH_SECRET') ||
      this.configService.get<string>('BACKEND_REFRESH_SECRET') ||
      accessSecret;
    const refreshExpires =
      this.configService.get<string>('REFRESH_EXPIRES_IN') ||
      this.configService.get<string>('BACKEND_REFRESH_EXPIRES_IN') ||
      '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    if (!dto.password) {
      throw new ConflictException('Password is required');
    }
    const user = await this.usersService.createUser(dto);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const tokens = await this.generateTokens(payload);
    await this.usersService.setHashedRefreshToken(
      user.id,
      await this.hashData(tokens.refreshToken),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async loginWithUser(user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt?: Date;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const tokens = await this.generateTokens(payload);
    await this.usersService.setHashedRefreshToken(
      user.id,
      await this.hashData(tokens.refreshToken),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access denied');
    }
    const tokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException('Access denied');
    }
    return user;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.validateRefreshToken(userId, refreshToken);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const tokens = await this.generateTokens(payload);
    await this.usersService.setHashedRefreshToken(
      user.id,
      await this.hashData(tokens.refreshToken),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateGoogleUser(profile: {
    id: string;
    email: string;
    name: string;
  }) {
    const existingByGoogle = await this.usersService.findByGoogleId(profile.id);
    if (existingByGoogle) return existingByGoogle;

    const existingByEmail = await this.usersService.findByEmail(profile.email);
    if (existingByEmail) {
      return existingByEmail;
    }

    return this.usersService.createUser({
      name: profile.name,
      email: profile.email,
      role: undefined,
      password: undefined,
      googleId: profile.id,
    });
  }

  async signOut(userId: number) {
    await this.usersService.setHashedRefreshToken(userId, null);
    return { success: true };
  }

  async loginFromGoogle(user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }) {
    return this.loginWithUser(user);
  }
}
