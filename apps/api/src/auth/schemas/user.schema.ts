import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../constants/auth.constants';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: Object.values(Role),
    default: Role.DOCTOR 
  })
  role: Role;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  blockedUntil: Date;

  @Prop()
  lastLoginAt: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;

  // For OAuth2
  @Prop()
  googleId: string;

  @Prop({ default: false })
  isOAuthUser: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);