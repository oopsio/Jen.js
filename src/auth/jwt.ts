import { sign, verify } from "jsonwebtoken";
import { log } from "../shared/log.js";

/**
 * Payload structure for JWT tokens.
 * Includes standard claims and custom user data.
 */
export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

// JWT secret from environment - required for token operations
let SECRET: string = process.env.JWT_SECRET || "";

// Validate that JWT_SECRET is set
if (!SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is required. Set JWT_SECRET in your .env file or environment.",
  );
}

/**
 * Creates a signed JWT token containing the provided payload.
 *
 * @param payload The data to encode in the token (userId required).
 * @param expiresIn Token expiration time (default "24h"). Format: "1h", "7d", "30s", etc.
 * @returns The signed JWT token as a string.
 * @throws Error if payload is invalid or signing fails.
 *
 * @example
 * const token = signToken({ userId: '123', role: 'admin' }, '24h');
 */
export function signToken(
  payload: TokenPayload,
  expiresIn: string = "24h",
): string {
  try {
    if (!payload.userId) {
      throw new Error("userId is required in token payload");
    }

    const token = sign(payload as any, SECRET as any, {
      expiresIn,
      algorithm: "HS256",
    } as any);

    log.info(`Token created for user ${payload.userId}`);
    return token;
  } catch (error) {
    log.error(
      `Token signing failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

/**
 * Verifies and decodes a JWT token, returning the payload if valid.
 *
 * @param token The JWT token string to verify.
 * @returns The decoded payload from the token.
 * @throws Error if the token is invalid, expired, or verification fails.
 *
 * @example
 * const payload = verifyToken(token);
 * console.log(payload.userId); // Access decoded data
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = verify(token, SECRET as any, {
      algorithms: ["HS256"],
    }) as unknown as TokenPayload;

    return decoded;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Token verification failed";
    log.error(`Token verification failed: ${message}`);
    throw new Error(`Invalid token: ${message}`);
  }
}

/**
 * Refresh a token by decoding and re-signing it with a new expiration.
 * Useful for extending user sessions while maintaining original payload.
 *
 * @param token The current JWT token to refresh.
 * @param expiresIn New expiration time (default "24h").
 * @returns A new signed token with extended expiration.
 * @throws Error if the current token is invalid or refresh fails.
 */
export function refreshToken(token: string, expiresIn: string = "24h"): string {
  try {
    const decoded = verifyToken(token);
    // Remove standard claims to avoid conflicts
    const { iat, exp, ...payload } = decoded;
    return signToken(payload as TokenPayload, expiresIn);
  } catch (error) {
    log.error(
      `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

/**
 * Decode a JWT token without verifying its signature.
 * WARNING: Only use for extracting token info when signature verification is not needed.
 *
 * @param token The JWT token string to decode.
 * @returns The decoded payload (unverified).
 * @throws Error if the token is malformed.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = verify(token, SECRET as any, { ignoreExpiration: true });
    return decoded as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}
