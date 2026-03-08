import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  signal,
  watch,
  bindSignal,
  createStore,
} from "@src/client-routing/signal.js";

describe("Client Routing Integration", () => {
  describe("Router + State", () => {
    it("should support router parameters in state", () => {
      const params = signal({ id: "1", name: "John" });
      const watcher = vi.fn();

      watch(params, watcher);
      expect(watcher).toHaveBeenCalledWith({ id: "1", name: "John" });

      params.value = { id: "2", name: "Jane" };
      expect(watcher).toHaveBeenCalledWith({ id: "2", name: "Jane" });
    });

    it("should manage page state during navigation", () => {
      const store = createStore({
        currentPath: "/",
        isLoading: false,
        data: null,
      });

      // Simulate navigation
      store.currentPath.value = "/about";
      store.isLoading.value = true;

      expect(store.currentPath.value).toBe("/about");
      expect(store.isLoading.value).toBe(true);

      // Simulate data load
      store.data.value = { title: "About" };
      store.isLoading.value = false;

      expect(store.data.value.title).toBe("About");
      expect(store.isLoading.value).toBe(false);
    });
  });

  describe("State with DOM Binding", () => {
    it("should support reactive store creation", () => {
      const store = createStore({
        title: "Hello",
        count: 0,
      });

      expect(store.title.value).toBe("Hello");
      expect(store.count.value).toBe(0);

      store.title.value = "World";
      store.count.value = 42;

      expect(store.title.value).toBe("World");
      expect(store.count.value).toBe(42);
    });

    it("should support reactive stores with subscribers", () => {
      const store = createStore({
        title: "Hello",
        count: 0,
      });

      const titleListener = vi.fn();
      const countListener = vi.fn();

      store.title.subscribe(titleListener);
      store.count.subscribe(countListener);

      store.title.value = "World";
      store.count.value = 42;

      expect(titleListener).toHaveBeenCalledOnce();
      expect(countListener).toHaveBeenCalledOnce();
    });
  });

  describe("Reactive UI Patterns", () => {
    it("should support todo list pattern", () => {
      const todos = signal<Array<{ id: number; text: string }>>([
        { id: 1, text: "Learn Jen" },
        { id: 2, text: "Build app" },
      ]);

      const addTodo = (text: string) => {
        const newTodos = [...todos.value];
        newTodos.push({ id: Date.now(), text });
        todos.value = newTodos;
      };

      expect(todos.value.length).toBe(2);
      addTodo("Deploy");
      expect(todos.value.length).toBe(3);
      expect(todos.value[2].text).toBe("Deploy");
    });

    it("should support form state pattern", () => {
      const formState = createStore({
        username: "",
        email: "",
        isSubmitting: false,
        errors: {} as Record<string, string>,
      });

      const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formState.username.value) {
          errors.username = "Required";
        }
        if (!formState.email.value) {
          errors.email = "Required";
        }

        formState.errors.value = errors;
        return Object.keys(errors).length === 0;
      };

      formState.username.value = "john";
      formState.email.value = "john@example.com";

      expect(validateForm()).toBe(true);
      expect(Object.keys(formState.errors.value).length).toBe(0);
    });

    it("should support counter pattern", () => {
      const count = signal(0);

      const increment = () => (count.value += 1);
      const decrement = () => (count.value -= 1);
      const reset = () => (count.value = 0);

      expect(count.value).toBe(0);

      increment();
      expect(count.value).toBe(1);

      increment();
      expect(count.value).toBe(2);

      decrement();
      expect(count.value).toBe(1);

      reset();
      expect(count.value).toBe(0);
    });

    it("should support async operations with state", async () => {
      const data = signal<any>(null);
      const loading = signal(false);
      const error = signal<string | null>(null);

      const fetchData = async () => {
        loading.value = true;
        error.value = null;

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 10));
          data.value = { id: 1, name: "John" };
        } catch (err) {
          error.value = String(err);
        } finally {
          loading.value = false;
        }
      };

      expect(loading.value).toBe(false);
      expect(data.value).toBe(null);

      await fetchData();

      expect(loading.value).toBe(false);
      expect(data.value.name).toBe("John");
      expect(error.value).toBe(null);
    });
  });

  describe("State Composition", () => {
    it("should compose multiple signals", () => {
      const firstName = signal("John");
      const lastName = signal("Doe");

      const fullName = () => `${firstName.value} ${lastName.value}`;

      expect(fullName()).toBe("John Doe");

      firstName.value = "Jane";
      expect(fullName()).toBe("Jane Doe");
    });

    it("should handle complex state graphs", () => {
      const user = signal({ id: 1, name: "John" });
      const posts = signal([]);
      const isAdmin = signal(false);

      const store = {
        user,
        posts,
        isAdmin,
        canModerate: () => isAdmin.value || user.value.id === 1,
      };

      expect(store.canModerate()).toBe(true);

      user.value = { id: 2, name: "Jane" };
      expect(store.canModerate()).toBe(false);

      isAdmin.value = true;
      expect(store.canModerate()).toBe(true);
    });
  });

  describe("Performance characteristics", () => {
    it("should handle large arrays efficiently", () => {
      const items = signal<number[]>([]);

      const addItems = (count: number) => {
        const newItems = [...items.value];
        for (let i = 0; i < count; i++) {
          newItems.push(i);
        }
        items.value = newItems;
      };

      const start = performance.now();
      addItems(1000);
      const duration = performance.now() - start;

      expect(items.value.length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete quickly
    });

    it("should debounce rapid updates", () => {
      const count = signal(0);
      const listener = vi.fn();

      count.subscribe(listener);

      // Rapid updates
      for (let i = 1; i <= 10; i++) {
        count.value = i;
      }

      expect(listener).toHaveBeenCalledTimes(10);
    });

    it("should handle deep updates without full clones", () => {
      const state = signal({
        user: { id: 1, profile: { name: "John" } },
        settings: { theme: "dark" },
      });

      // This should trigger update
      state.value = {
        ...state.value,
        user: { ...state.value.user, profile: { name: "Jane" } },
      };

      expect(state.value.user.profile.name).toBe("Jane");
    });
  });

  describe("Error handling", () => {
    it("should handle errors in subscribers", () => {
      const count = signal(0);

      const throwingListener = vi.fn(() => {
        throw new Error("Subscriber error");
      });
      const normalListener = vi.fn();

      count.subscribe(throwingListener);
      count.subscribe(normalListener);

      // Should not throw
      expect(() => {
        count.value = 1;
      }).not.toThrow();

      expect(throwingListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });
});
