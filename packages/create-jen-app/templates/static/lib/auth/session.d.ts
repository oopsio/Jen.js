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

interface SessionData {
  userId: string;
  createdAt: number;
  expiresAt: number;
  [key: string]: any;
}
/**
 * In-memory session manager
 * WARNING: Sessions are lost on server restart
 * For production, use persistent storage (Redis, Database, etc.)
 */
export declare class SessionManager {
  private sessions;
  constructor();
  /**
   * Create a new session with automatic expiration
   */
  createSession(userId: string, data?: Record<string, any>): string;
  /**
   * Get session with expiration check
   */
  getSession(sessionId: string): SessionData | null;
  /**
   * Destroy session immediately
   */
  destroySession(sessionId: string): void;
  /**
   * Verify session is valid and return user ID
   */
  verifySession(sessionId: string): string | null;
  /**
   * Update session expiration
   */
  refreshSession(sessionId: string): boolean;
  /**
   * Generate cryptographically secure session ID
   */
  private generateSecureSessionId;
  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions;
}
export {};
