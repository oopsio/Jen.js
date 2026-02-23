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
export declare function signToken(payload: object, expiresIn?: string): void;
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
export declare function verifyToken(token: string): void;
