import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost',
      scope: ['email', 'profile'],
    });

    const missing =
      !configService.get<string>('GOOGLE_CLIENT_ID') ||
      !configService.get<string>('GOOGLE_CLIENT_SECRET') ||
      !configService.get<string>('GOOGLE_CALLBACK_URL');
    if (missing) {
      Logger.warn('Google OAuth not configured; GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL missing');
    }
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || profile.name?.givenName || 'Google User';
    if (!email) {
      return null;
    }
    const user = await this.authService.validateGoogleUser({
      id: profile.id,
      email,
      name,
    });
    return user;
  }
}
