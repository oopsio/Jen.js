export class SessionManager {
    sessions = new Map();
    createSession(userId, data) {
        this.sessions.set(userId, data);
    }
    getSession(userId) {
        return this.sessions.get(userId);
    }
    destroySession(userId) {
        this.sessions.delete(userId);
    }
}
