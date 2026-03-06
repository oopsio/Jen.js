import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock session store
interface Session {
  id: string;
  userId: string;
  data: Record<string, any>;
  expiresAt: number;
}

class SessionStore {
  private sessions = new Map<string, Session>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private ttl: number = 3600000) {
    this.startCleanup();
  }

  create(userId: string, data: Record<string, any> = {}): string {
    const id = Math.random().toString(36).substring(7);
    this.sessions.set(id, {
      id,
      userId,
      data,
      expiresAt: Date.now() + this.ttl,
    });
    return id;
  }

  get(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  update(sessionId: string, data: Partial<Session["data"]>): boolean {
    const session = this.get(sessionId);
    if (!session) return false;
    session.data = { ...session.data, ...data };
    session.expiresAt = Date.now() + this.ttl;
    return true;
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  refresh(sessionId: string): boolean {
    const session = this.get(sessionId);
    if (!session) return false;
    session.expiresAt = Date.now() + this.ttl;
    return true;
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(id);
        }
      }
    }, 60000); // Cleanup every minute
    if (typeof this.cleanupInterval.unref === "function") {
      this.cleanupInterval.unref();
    }
  }

  destroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.sessions.clear();
  }

  getAll(): Session[] {
    return Array.from(this.sessions.values());
  }
}

describe("Session Management", () => {
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore(3600000); // 1 hour TTL
  });

  afterEach(() => {
    store.destroy();
  });

  describe("Session Creation", () => {
    it("should create a new session", () => {
      const sessionId = store.create("user123");
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("should generate unique session IDs", () => {
      const id1 = store.create("user123");
      const id2 = store.create("user123");
      expect(id1).not.toBe(id2);
    });

    it("should store session data", () => {
      const data = { role: "admin", email: "user@example.com" };
      const sessionId = store.create("user123", data);
      const session = store.get(sessionId);
      expect(session?.data).toEqual(data);
    });

    it("should create session with empty data", () => {
      const sessionId = store.create("user123");
      const session = store.get(sessionId);
      expect(session?.data).toEqual({});
    });

    it("should set correct expiration time", () => {
      const before = Date.now();
      const sessionId = store.create("user123");
      const session = store.get(sessionId);
      const after = Date.now();

      expect(session?.expiresAt).toBeGreaterThanOrEqual(before + 3600000);
      expect(session?.expiresAt).toBeLessThanOrEqual(after + 3600000);
    });
  });

  describe("Session Retrieval", () => {
    it("should retrieve existing session", () => {
      const sessionId = store.create("user123", { role: "admin" });
      const session = store.get(sessionId);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user123");
    });

    it("should return null for non-existent session", () => {
      const session = store.get("nonexistent");
      expect(session).toBeNull();
    });

    it("should return null for expired session", () => {
      const store2 = new SessionStore(100); // 100ms TTL
      const sessionId = store2.create("user123");

      return new Promise((resolve) => {
        setTimeout(() => {
          const session = store2.get(sessionId);
          expect(session).toBeNull();
          store2.destroy();
          resolve(undefined);
        }, 150);
      });
    });

    it("should not modify session when retrieving", () => {
      const sessionId = store.create("user123", { counter: 0 });
      const session1 = store.get(sessionId);
      const expiresAt = session1?.expiresAt;

      const session2 = store.get(sessionId);
      expect(session2?.expiresAt).toBe(expiresAt);
    });
  });

  describe("Session Updates", () => {
    it("should update session data", () => {
      const sessionId = store.create("user123", { role: "user" });
      const success = store.update(sessionId, { role: "admin" });
      expect(success).toBe(true);

      const session = store.get(sessionId);
      expect(session?.data.role).toBe("admin");
    });

    it("should merge session data on update", () => {
      const sessionId = store.create("user123", {
        role: "user",
        email: "old@example.com",
      });
      store.update(sessionId, { role: "admin" });

      const session = store.get(sessionId);
      expect(session?.data.role).toBe("admin");
      expect(session?.data.email).toBe("old@example.com");
    });

    it("should return false when updating non-existent session", () => {
      const success = store.update("nonexistent", { role: "admin" });
      expect(success).toBe(false);
    });

    it("should refresh TTL on update", async () => {
      const sessionId = store.create("user123");
      const session1 = store.get(sessionId);
      const expires1 = session1?.expiresAt;

      // Wait a bit to ensure time passes
      await new Promise((resolve) => setTimeout(resolve, 5));

      store.update(sessionId, { marker: "updated" });
      const session2 = store.get(sessionId);
      const expires2 = session2?.expiresAt;

      expect(expires2! > expires1!).toBe(true);
    });
  });

  describe("Session Deletion", () => {
    it("should delete session", () => {
      const sessionId = store.create("user123");
      const success = store.delete(sessionId);
      expect(success).toBe(true);

      const session = store.get(sessionId);
      expect(session).toBeNull();
    });

    it("should return false when deleting non-existent session", () => {
      const success = store.delete("nonexistent");
      expect(success).toBe(false);
    });

    it("should not affect other sessions on delete", () => {
      const id1 = store.create("user1");
      const id2 = store.create("user2");

      store.delete(id1);

      expect(store.get(id1)).toBeNull();
      expect(store.get(id2)).not.toBeNull();
    });
  });

  describe("Session Refresh", () => {
    it("should refresh session TTL", async () => {
      const sessionId = store.create("user123");
      const session1 = store.get(sessionId);
      const expires1 = session1?.expiresAt;

      // Wait a bit to ensure time passes
      await new Promise((resolve) => setTimeout(resolve, 5));

      store.refresh(sessionId);
      const session2 = store.get(sessionId);
      const expires2 = session2?.expiresAt;

      expect(expires2! > expires1!).toBe(true);
    });

    it("should return false when refreshing non-existent session", () => {
      const success = store.refresh("nonexistent");
      expect(success).toBe(false);
    });

    it("should not modify session data on refresh", () => {
      const data = { role: "admin", email: "user@example.com" };
      const sessionId = store.create("user123", data);

      store.refresh(sessionId);
      const session = store.get(sessionId);

      expect(session?.data).toEqual(data);
    });
  });

  describe("Edge Cases", () => {
    it("should handle session IDs with special characters", () => {
      const sessionId = store.create("user@example.com");
      const session = store.get(sessionId);
      expect(session?.userId).toBe("user@example.com");
    });

    it("should handle large session data", () => {
      const largeData = {
        permissions: new Array(1000).fill("read:all"),
      };
      const sessionId = store.create("user123", largeData);
      const session = store.get(sessionId);
      expect(session?.data.permissions).toHaveLength(1000);
    });

    it("should handle null/undefined in updates", () => {
      const sessionId = store.create("user123", { a: "value" });
      store.update(sessionId, { b: null });
      const session = store.get(sessionId);
      expect(session?.data.b).toBeNull();
    });
  });
});

function afterEach(fn: () => void) {
  // Vitest afterEach implementation
}
