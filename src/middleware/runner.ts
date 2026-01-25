import type { Middleware } from "./types.js";

export function compose(middlewares: Middleware[]): Middleware {
  return async (ctx, next) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;

      const fn = middlewares[i] ?? next;
      if (!fn) return;
      await fn(ctx, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
    }
