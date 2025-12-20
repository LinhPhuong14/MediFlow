import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import {
  JWT_CONFIG,
  LOGIN_CONFIG,
  PASSWORD_REGEX,
  ALLOWED_OAUTH_DOMAINS,
} from './constants/auth.constants';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked && user.blockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily blocked');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.resetFailedLoginAttempts(user);

    user.lastLoginAt = new Date();
    await user.save();

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any, ipAddress: string, userAgent: string) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);

    // Save refresh token
    await this.saveRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    this.logger.log(`User ${user.email} logged in from ${ipAddress}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenModel.findOneAndUpdate(
      { token: refreshToken },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.refreshTokenModel
      .findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .populate('userId');

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = storedToken.userId as any;
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);

    // Revoke old token and save new one
    await this.refreshTokenModel.findByIdAndUpdate(storedToken._id, {
      isRevoked: true,
      revokedAt: new Date(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      {
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: JWT_CONFIG.PASSWORD_RESET_EXPIRY,
      },
    );

    user.passwordResetToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send email
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    this.logger.log(`Password reset requested for ${email}`);
  }

  async resetPassword(token: string, newPassword: string) {
    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new BadRequestException(
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      );
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userModel.findOne({
      _id: decoded.sub,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all refresh tokens for this user
    await this.refreshTokenModel.updateMany(
      { userId: user._id },
      { isRevoked: true, revokedAt: new Date() },
    );

    this.logger.log(`Password reset successful for ${user.email}`);
  }

  async validateOAuthEmail(email: string): Promise<boolean> {
    const emailDomain = email.split('@')[1];
    return ALLOWED_OAUTH_DOMAINS.includes(emailDomain);
  }

  private async generateTokens(payload: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });
  }

  private async handleFailedLogin(user: User) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= LOGIN_CONFIG.MAX_FAILED_ATTEMPTS) {
      user.isBlocked = true;
      user.blockedUntil = new Date(
        Date.now() + LOGIN_CONFIG.BLOCK_DURATION_MINUTES * 60 * 1000,
      );

      // Notify admin
      await this.mailService.sendLoginBlockedAlert(
        user.email,
        user.failedLoginAttempts,
        user.blockedUntil,
      );
    }

    await user.save();
  }

  private async resetFailedLoginAttempts(user: User) {
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.isBlocked = false;
      user.blockedUntil = null;
      await user.save();
    }
  }
  async findOrCreateOAuthUser(profile: any): Promise<User> {
    const { googleId, email, firstName, lastName, picture } = profile;

    // Tìm user theo googleId hoặc email
    let user = await this.userModel.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await this.userModel.create({
        email,
        password: tempPassword,
        googleId,
        firstName,
        lastName,
        picture,
        isOAuthUser: true,
        isEmailVerified: true, // OAuth emails thường đã được verify
        role: Role.DOCTOR, // Mặc định là doctor
      });

      // Gửi email welcome
      await this.mailService.sendWelcomeEmail(
        email,
        `${firstName} ${lastName}`,
      );

      this.logger.log(`New OAuth user created: ${email}`);
    } else if (!user.googleId) {
      // Link existing account với Google
      user.googleId = googleId;
      user.isOAuthUser = true;
      await user.save();

      this.logger.log(`Existing user linked with Google: ${email}`);
    }

    return user;
  }

  async linkOAuthAccount(userId: string, oauthData: any): Promise<any> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Kiểm tra email có trùng không
    if (user.email !== oauthData.email) {
      throw new BadRequestException('Email mismatch');
    }

    // Cập nhật thông tin OAuth
    user.googleId = oauthData.providerId;
    user.isOAuthUser = true;
    await user.save();

    return { message: 'Account linked successfully' };
  }

  async getOAuthStatus(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      isOAuthUser: user.isOAuthUser,
      googleId: user.googleId,
      email: user.email,
    };
  }

  async getLoginHistory(userId: string, limit: number = 10): Promise<any[]> {
    return this.refreshTokenModel
      .find({ userId, isRevoked: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('ipAddress userAgent createdAt')
      .lean();
  }
}
