/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * JWT token utilities for creating and validating JSON Web Tokens.
 * This module provides stub implementations that require an external JWT library.
 * Users must install a JWT library (e.g., jsonwebtoken) and implement these functions
 * using that library's APIs to enable authentication features.
 *
 * The module validates that JWT_SECRET is configured in the environment,
 * ensuring token signing and verification can proceed securely.
 */
// JWT signing and verification require an external library not included by default.
// Users should install jsonwebtoken: npm install jsonwebtoken
const SECRET = process.env.JWT_SECRET;
// Validate that JWT_SECRET is set. This environment variable is required for all token operations.
// Without a secret, tokens cannot be securely signed or verified.
if (!SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is required. Set JWT_SECRET in your .env file or environment.",
  );
}
/**
 * Creates a signed JWT token containing the provided payload.
 * This function is a stub that requires implementing with an external JWT library.
 *
 * @param payload The data to encode in the token.
 * @param expiresIn Token expiration time (default "1h"). Format: "1h", "7d", "30s", etc.
 * @returns The signed JWT token as a string.
 * @throws Error indicating that a JWT library must be installed.
 *
 * @example
 * const token = signToken({ userId: 123, role: 'admin' }, '24h');
 * // Implementation using jsonwebtoken:
 * // jwt.sign(payload, SECRET, { expiresIn });
 */
export function signToken(payload, expiresIn = "1h") {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}
/**
 * Verifies and decodes a JWT token, returning the payload if valid.
 * This function is a stub that requires implementing with an external JWT library.
 *
 * @param token The JWT token string to verify.
 * @returns The decoded payload from the token.
 * @throws Error indicating that a JWT library must be installed.
 * @throws Error if the token is invalid, expired, or fails verification.
 *
 * @example
 * const payload = verifyToken(token);
 * // Implementation using jsonwebtoken:
 * // jwt.verify(token, SECRET);
 */
export function verifyToken(token) {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}
