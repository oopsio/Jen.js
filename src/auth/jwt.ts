// JWT token utilities - external JWT library not included
// Users should implement with their own jwt library (e.g., npm install jsonwebtoken)

const SECRET = process.env.JWT_SECRET || 'supersecret';

export function signToken(payload: object, expiresIn: string = '1h') {
  throw new Error('JWT implementation requires external library. Install: npm install jsonwebtoken');
}

export function verifyToken(token: string) {
  throw new Error('JWT implementation requires external library. Install: npm install jsonwebtoken');
}
