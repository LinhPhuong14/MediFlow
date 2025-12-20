import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { PASSWORD_REGEX } from './constants/auth.constants';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService
  ) {}

  async validatePasswordStrength(password: string): Promise<{ valid: boolean; message?: string }> {
    if (!PASSWORD_REGEX.test(password)) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
      };
    }

    // Check for common passwords
    const commonPasswords = ['password123', 'admin123', '12345678', 'qwerty123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return {
        valid: false,
        message: 'Password is too common. Please choose a stronger password'
      };
    }

    return { valid: true };
  }

  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findById(userId).select('+password');
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Validate new password
      const validation = await this.validatePasswordStrength(newPassword);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Check if new password is same as last 3 passwords
      const isRecentlyUsed = await this.checkRecentlyUsedPasswords(userId, newPassword);
      if (isRecentlyUsed) {
        return { 
          success: false, 
          message: 'This password has been used recently. Please choose a different one' 
        };
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      
      // Save old password for history check
      await this.savePasswordHistory(userId, hashedPassword);
      
      await user.save();

      // Send notification email
      await this.mailService.sendPasswordChangedEmail(user.email);

      this.logger.log(`Password changed successfully for user: ${user.email}`);

      return { 
        success: true, 
        message: 'Password changed successfully' 
      };
    } catch (error) {
      this.logger.error(`Error changing password: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to change password' };
    }
  }

  async checkRecentlyUsedPasswords(userId: string, newPassword: string): Promise<boolean> {
    // In a real implementation, you would check against password history
    // For now, return false
    return false;
  }

  async savePasswordHistory(userId: string, hashedPassword: string): Promise<void> {
    // Implementation for saving password history
    // This could be a separate collection or an array in user document
  }

  async enforcePasswordPolicy(userId: string): Promise<void> {
    // Check if password needs to be changed (e.g., every 90 days)
    const user = await this.userModel.findById(userId);
    if (!user) return;

    const passwordAgeInDays = this.getPasswordAge(user);
    
    if (passwordAgeInDays > 90) {
      await this.mailService.sendPasswordExpiryWarning(user.email, passwordAgeInDays);
    }
  }

  private getPasswordAge(user: any): number {
    // Calculate how old the password is
    // This requires storing passwordChangedAt timestamp
    return 0; // Placeholder
  }
}