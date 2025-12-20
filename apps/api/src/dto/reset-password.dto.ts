import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../auth/constants/auth.constants';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX)
  confirmPassword: string;
}