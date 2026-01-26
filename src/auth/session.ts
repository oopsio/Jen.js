type Session = Record<string, any>;

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(userId: string, data: any) {
    this.sessions.set(userId, data);
  }

  getSession(userId: string) {
    return this.sessions.get(userId);
  }

  destroySession(userId: string) {
    this.sessions.delete(userId);
  }
}
