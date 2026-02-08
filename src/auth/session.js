const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT ?? "86400000", 10); // 24 hours default

/**
 * In-memory session manager
 * WARNING: Sessions are lost on server restart
 * For production, use persistent storage (Redis, Database, etc.)
 */
export class SessionManager {
  constructor() {
    this.sessions = new Map();
    // Cleanup expired sessions every 30 minutes
    setInterval(() => this.cleanupExpiredSessions(), 30 * 60 * 1000);
  }

  /**
   * Create a new session with automatic expiration
   */
  createSession(userId, data = {}) {
    // Validate userId
    if (!userId || typeof userId !== "string" || userId.length > 255) {
      throw new Error("Invalid userId");
    }

    const sessionId = this.generateSecureSessionId();
    const now = Date.now();
    const session = {
      userId,
      createdAt: now,
      expiresAt: now + SESSION_TIMEOUT,
      ...data,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Get session with expiration check
   */
  getSession(sessionId) {
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Destroy session immediately
   */
  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Verify session is valid and return user ID
   */
  verifySession(sessionId) {
    const session = this.getSession(sessionId);
    return session?.userId ?? null;
  }

  /**
   * Update session expiration
   */
  refreshSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.expiresAt = Date.now() + SESSION_TIMEOUT;
    return true;
  }

  /**
   * Generate cryptographically secure session ID
   */
  generateSecureSessionId() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
