import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { GlobalCache } from "../cache.js";
import { jenFetch } from "../fetch.js";
import { ActionRegistry, executeAction } from "../actions.js";

describe("Jen.js Core Server Features", () => {
    
    describe("GlobalCache with TTL", () => {
        beforeAll(() => GlobalCache.clear());

        test("should set and get values", () => {
            GlobalCache.set("test-key", { foo: "bar" });
            expect(GlobalCache.get("test-key")).toEqual({ foo: "bar" });
        });

        test("should support TTL", async () => {
            GlobalCache.set("temp-key", "temporary", { ttl: 1 }); // 1 second
            expect(GlobalCache.get("temp-key")).toBe("temporary");
            
            // Wait for expiration
            await new Promise(r => setTimeout(r, 1100));
            expect(GlobalCache.get("temp-key")).toBeNull();
        });

        test("should delete and clear", () => {
            GlobalCache.set("a", 1);
            GlobalCache.set("b", 2);
            GlobalCache.delete("a");
            expect(GlobalCache.get("a")).toBeNull();
            expect(GlobalCache.get("b")).toBe(2);
            GlobalCache.clear();
            expect(GlobalCache.get("b")).toBeNull();
        });
    });

    describe("jenFetch", () => {
        beforeAll(() => GlobalCache.clear());

        test("should deduplicate in-flight requests", async () => {
            const url = "https://jsonplaceholder.typicode.com/todos/1";
            const p1 = jenFetch(url);
            const p2 = jenFetch(url);
            
            // They should be the exact same promise instance
            expect(p1 === p2).toBe(true);
            await p1;
        });

        test("should cache results when revalidate is set", async () => {
            const url = "https://jsonplaceholder.typicode.com/todos/2";
            await jenFetch(url, { next: { revalidate: 60 } });
            
            // Check if it's in GlobalCache
            const cached = GlobalCache.get<any>(`fetch:GET:${url}`);
            expect(cached).toBeDefined();
            expect(cached.id).toBe(2);
        });
    });

    describe("Server Actions", () => {
        test("should register and execute actions", async () => {
            const myAction = async (name: string) => `Hello ${name}`;
            const id = "test-action-id";
            ActionRegistry.register(id, myAction);

            const result = await executeAction(id, ["Jen"]);
            expect(result.success).toBe(true);
            expect(result.data).toBe("Hello Jen");
        });

        test("should handle action errors", async () => {
            const failingAction = async () => { throw new Error("Boom"); };
            const id = "fail-id";
            ActionRegistry.register(id, failingAction);

            const result = await executeAction(id, []);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Boom");
        });
    });
});
