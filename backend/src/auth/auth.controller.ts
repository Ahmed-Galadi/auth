import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Legacy compatibility
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Req() req: any) {
    return this.authService.loginWithUser(req.user);
  }

  // Legacy compatibility
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any) {
    return this.authService.loginWithUser(req.user);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {
    return { url: 'redirecting to google' };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const authResponse = await this.authService.loginFromGoogle({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    
    // Redirect to frontend callback page with tokens in URL
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/google/callback?success=true`;
    
    // Set tokens as cookies for the frontend
    res.cookie('token', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return res.redirect(redirectUrl);
  }

  @Post('signout')
  async signOut(@Req() req: any) {
    await this.authService.signOut(req.user.userId);
    return { success: true };
  }

  // Legacy compatibility
  @Public()
  @Post('logout')
  async logout(@Req() req: any) {
    if (req.user?.userId) {
      await this.authService.signOut(req.user.userId);
    }
    return { success: true };
  }
}
