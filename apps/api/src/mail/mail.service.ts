import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl = configService.get<string>('FRONTEND_URL');
    
    this.transporter = createTransport({
      host: configService.get<string>('SMTP_HOST'),
      port: configService.get<number>('SMTP_PORT'),
      secure: configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Hospital System" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <p>
            <a href="${resetLink}" style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            ">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, please ignore this email.</p>
          <p><strong>Note:</strong> This link will expire in 15 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Hospital System &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    const mailOptions = {
      from: `"Hospital System" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed</h2>
          <p>Your password has been changed successfully.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Hospital System &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendLoginBlockedAlert(
    email: string, 
    failedAttempts: number, 
    blockedUntil: Date
  ): Promise<void> {
    const mailOptions = {
      from: `"Hospital System" <${this.configService.get('SMTP_FROM')}>`,
      to: this.configService.get<string>('ADMIN_EMAIL'),
      subject: '🚨 User Account Blocked Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Account Blocked Alert</h2>
          <p><strong>User Email:</strong> ${email}</p>
          <p><strong>Failed Attempts:</strong> ${failedAttempts}</p>
          <p><strong>Blocked Until:</strong> ${blockedUntil.toLocaleString()}</p>
          <p><strong>IP Address:</strong> [Will be added from context]</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Security Alert - Hospital System
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    this.logger.warn(`Login blocked alert sent for user: ${email}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"Hospital System" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Welcome to Hospital System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been created successfully.</p>
          <p>You can now log in to the Hospital System using your credentials.</p>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Hospital System &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSecurityAlert(email: string, alertType: string, details: any): Promise<void> {
    const mailOptions = {
      from: `"Hospital System Security" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: `Security Alert: ${alertType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">Security Alert</h2>
          <p><strong>Type:</strong> ${alertType}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
          <p>If this wasn't you, please secure your account immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Hospital System Security &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}