import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken"
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined")

// ========================
// ✅ Dùng cho SERVER (Node.js)
// ========================
export function signToken(payload: object, expiresIn: string = "7d"): string {
  console.log("🔑 [JWT] Signing token with payload:", { ...payload, expiresIn });
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  console.log("✅ [JWT] Token signed successfully");
  return token;
}

export function verifyToken<T extends object = JwtPayload>(token: string): T {
  console.log("🔍 [JWT] Verifying token...");
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    console.log("✅ [JWT] Token verified successfully:", { userId: (decoded as any).id });
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.error("❌ [JWT] Token expired:", error.message);
      throw new Error("TOKEN_EXPIRED");
    } else if (error instanceof JsonWebTokenError) {
      console.error("❌ [JWT] Invalid token:", error.message);
      throw new Error("INVALID_TOKEN");
    } else {
      console.error("❌ [JWT] Token verification failed:", error);
      throw new Error("TOKEN_VERIFICATION_FAILED");
    }
  }
}

export function decodeToken(token: string): JwtPayload | null {
  console.log("🔍 [JWT] Decoding token (without verification)...");
  
  try {
    const decoded = jwt.decode(token);
    const result = typeof decoded === "object" ? decoded : null;
    console.log("✅ [JWT] Token decoded:", result ? { userId: (result as any).id, exp: result.exp } : null);
    return result;
  } catch (error) {
    console.error("❌ [JWT] Token decode failed:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < now;
    console.log("🕐 [JWT] Token expiration check:", { exp: decoded.exp, now, isExpired });
    return isExpired;
  } catch (error) {
    console.error("❌ [JWT] Token expiration check failed:", error);
    return true;
  }
}

// ========================
// ✅ Dùng cho Middleware (Edge Runtime)
// ========================
const joseSecret = new TextEncoder().encode(JWT_SECRET); // convert string → Uint8Array

export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  console.log("🔍 [JWT-EDGE] Verifying token in middleware...");
  
  try {
    const { payload } = await jwtVerify(token, joseSecret);
    console.log("✅ [JWT-EDGE] Token verified successfully:", { userId: (payload as any).id });
    return payload;
  } catch (err) {
    console.error("❌ [JWT-EDGE] Middleware token verify failed:", err);
    return null;
  }
}