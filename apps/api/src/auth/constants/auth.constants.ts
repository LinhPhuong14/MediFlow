export enum Role {
  SUPER_ADMIN = 'super_admin',
  DOCTOR = 'doctor'
}

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '3d',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_RESET_EXPIRY: '15m'
};

export const LOGIN_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  BLOCK_DURATION_MINUTES: 30
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ALLOWED_OAUTH_DOMAINS = ['hospital.com', 'clinic.com'];