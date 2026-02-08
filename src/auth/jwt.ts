// JWT token utilities - external JWT library not included
// Users should implement with their own jwt library (e.g., npm install jsonwebtoken)

const SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is configured
if (!SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is required. Set JWT_SECRET in your .env file or environment.",
  );
}

export function signToken(payload: object, expiresIn: string = "1h") {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}

export function verifyToken(token: string) {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}
