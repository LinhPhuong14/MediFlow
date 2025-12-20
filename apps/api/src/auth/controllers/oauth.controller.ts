import { 
  Controller, 
  Get, 
  UseGuards, 
  Req, 
  Res, 
  HttpStatus, 
  Query,
  Post,
  Body,
  Ip,
  Headers
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { OAuthLoginDto } from '../../dto/oauth-login.dto';
import { Logger } from '@nestjs/common';

@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiate Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: any,
    @Res() res: Response,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ) {
    try {
      const user = req.user;
      
      // Check if email domain is allowed
      const isEmailAllowed = await this.authService.validateOAuthEmail(user.email);
      
      if (!isEmailAllowed) {
        this.logger.warn(`OAuth attempt with unauthorized email domain: ${user.email}`);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=unauthorized_domain`);
      }

      // Check if user exists in our database
      const existingUser = await this.authService.findOrCreateOAuthUser(user);
      
      // Generate tokens
      const tokens = await this.authService.login(
        existingUser, 
        ipAddress, 
        userAgent
      );

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?` +
        `access_token=${tokens.accessToken}&` +
        `refresh_token=${tokens.refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify(tokens.user))}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`OAuth callback error: ${error.message}`, error.stack);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  @Post('link-account')
  @UseGuards(AuthGuard('jwt'))
  async linkOAuthAccount(
    @Req() req: any,
    @Body() oauthLoginDto: OAuthLoginDto
  ) {
    const userId = req.user.id;
    return this.authService.linkOAuthAccount(userId, oauthLoginDto);
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getOAuthStatus(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.getOAuthStatus(userId);
  }
}