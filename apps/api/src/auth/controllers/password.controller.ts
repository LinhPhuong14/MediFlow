import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Patch,
  Param
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth/password')
export class PasswordController {
  constructor(private readonly authService: AuthService) {}

  @Post('forgot')
  @Throttle({ default: { limit: 3, ttl: 600 } }) // 3 attempts per 10 minutes
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { 
      message: 'If the email exists, a reset link will be sent' 
    };
  }

  @Patch('reset/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    await this.authService.resetPassword(token, resetPasswordDto.newPassword);
    return { message: 'Password reset successful' };
  }
}