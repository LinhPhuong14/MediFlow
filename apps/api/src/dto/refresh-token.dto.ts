import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT({ message: 'Please provide a valid refresh token' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}