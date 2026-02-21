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
