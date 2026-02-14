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

// JWT token utilities - external JWT library not included
// Users should implement with their own jwt library (e.g., npm install jsonwebtoken)
const SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is configured
if (!SECRET) {
  throw new Error(
    "CRITICAL: JWT_SECRET environment variable is required. Set JWT_SECRET in your .env file or environment.",
  );
}
export function signToken(payload, expiresIn = "1h") {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}
export function verifyToken(token) {
  throw new Error(
    "JWT implementation requires external library. Install: npm install jsonwebtoken",
  );
}
