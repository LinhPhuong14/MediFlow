import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
  SignOptions,
} from "jsonwebtoken";
import { jwtVerify } from "jose";

/* ========================
   ENV
======================== */

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined");
}

/* ========================
   SERVER (Node.js)
======================== */

/**
 * Sign JWT (Node.js only)
 */
export function signToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  console.log("🔑 [JWT] Signing token", { expiresIn });

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

/**
 * Verify JWT (Node.js only)
 */
export function verifyToken<T extends object = JwtPayload>(token: string): T {
  console.log("🔍 [JWT] Verifying token (Node)");

  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }

    if (error instanceof JsonWebTokenError) {
      throw new Error("INVALID_TOKEN");
    }

    throw new Error("TOKEN_VERIFICATION_FAILED");
  }
}

/**
 * Decode JWT without verification (Node.js only)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return typeof decoded === "object" ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Check token expiration (Node.js only)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/* ========================
   EDGE (Middleware / Vercel)
======================== */

/**
 * Edge runtime requires Uint8Array secret
 */
const joseSecret = new TextEncoder().encode(JWT_SECRET);

/**
 * Verify JWT in Edge (Middleware)
 */
export async function verifyTokenEdge(
  token: string
): Promise<JwtPayload | null> {
  console.log("🔍 [JWT-EDGE] Verifying token");

  try {
    const { payload } = await jwtVerify(token, joseSecret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
