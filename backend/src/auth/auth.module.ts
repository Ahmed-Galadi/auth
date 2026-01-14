import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';
import { GoogleStrategy } from './google.strategy';
import jwtConfig from './config/jwt.config';
import refreshConfig from './config/refresh.config';
import googleOauthConfig from './config/google-oauth.config';

const googleProviders = [GoogleStrategy];

const authProviders = [
  AuthService,
  LocalStrategy,
  JwtStrategy,
  RefreshTokenStrategy,
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL
    ? googleProviders
    : []),
];

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          config.get<string>('BACKEND_JWT_SECRET'),
        signOptions: {
          expiresIn:
            config.get<string>('JWT_EXPIRES_IN') ||
            config.get<string>('BACKEND_JWT_EXPIRES_IN') ||
            '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: authProviders,
  controllers: [AuthController],
})
export class AuthModule {}
