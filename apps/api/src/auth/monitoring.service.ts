import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    private mailService: MailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyAuthReport() {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      
      const stats = await this.getAuthStats(startDate);
      
      await this.mailService.sendDailyAuthReport(
        process.env.ADMIN_EMAIL,
        stats
      );
      
      this.logger.log('Daily auth report generated and sent');
    } catch (error) {
      this.logger.error(`Failed to generate daily report: ${error.message}`);
    }
  }

  private async getAuthStats(since: Date): Promise<any> {
    const [
      totalUsers,
      newUsers,
      failedLogins,
      successfulLogins,
      blockedUsers,
      activeRefreshTokens
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: since } }),
      this.userModel.countDocuments({ 
        failedLoginAttempts: { $gte: 1 },
        updatedAt: { $gte: since }
      }),
      this.refreshTokenModel.countDocuments({ 
        createdAt: { $gte: since },
        isRevoked: false
      }),
      this.userModel.countDocuments({ 
        isBlocked: true,
        blockedUntil: { $gt: new Date() }
      }),
      this.refreshTokenModel.countDocuments({ 
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      })
    ]);

    return {
      reportDate: new Date(),
      period: '24 hours',
      metrics: {
        totalUsers,
        newUsers,
        failedLogins,
        successfulLogins,
        blockedUsers,
        activeRefreshTokens,
        blockedUsersPercentage: totalUsers > 0 ? (blockedUsers / totalUsers * 100).toFixed(2) : 0
      }
    };
  }

  async getRealTimeMetrics(): Promise<any> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentLogins = await this.refreshTokenModel.countDocuments({
      createdAt: { $gte: fiveMinutesAgo }
    });

    const recentFailed = await this.userModel.countDocuments({
      failedLoginAttempts: { $gte: 1 },
      updatedAt: { $gte: fiveMinutesAgo }
    });

    return {
      timestamp: now,
      recentLogins,
      recentFailed,
      activeUsers: await this.getActiveUserCount()
    };
  }

  private async getActiveUserCount(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const activeTokens = await this.refreshTokenModel.distinct('userId', {
      createdAt: { $gte: fifteenMinutesAgo },
      isRevoked: false
    });

    return activeTokens.length;
  }
}