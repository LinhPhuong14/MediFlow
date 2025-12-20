export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
}

export interface ResetTokenPayload {
  sub: string;
  email: string;
  type: 'reset';
}

export interface OAuthUserProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}