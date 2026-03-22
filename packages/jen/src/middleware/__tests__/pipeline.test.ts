/**
 * Middleware Pipeline Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { MiddlewarePipeline, ContextBuilder } from '../index';
import type { MiddlewareContext } from '../index';

describe('MiddlewarePipeline', () => {
  let pipeline: MiddlewarePipeline;
  let context: MiddlewareContext;

  beforeEach(() => {
    pipeline = new MiddlewarePipeline();
    const request = new Request('http://localhost/test', { method: 'GET' });
    context = ContextBuilder.build(request);
  });

  describe('Middleware Registration', () => {
    it('should register middleware', () => {
      pipeline.use('test', async (ctx, next) => {
        await next();
      });

      expect(pipeline.getMiddlewares()).toContain('test');
    });

    it('should register multiple middlewares', () => {
      pipeline
        .use('first', async (ctx, next) => await next())
        .use('second', async (ctx, next) => await next())
        .use('third', async (ctx, next) => await next());

      expect(pipeline.getMiddlewares().length).toBe(3);
    });

    it('should support method chaining', () => {
      const result = pipeline
        .use('m1', async (ctx, next) => await next())
        .use('m2', async (ctx, next) => await next());

      expect(result).toBe(pipeline);
    });
  });

  describe('Sequential Execution', () => {
    it('should execute middlewares in order', async () => {
      const order: string[] = [];

      pipeline
        .use('first', async (ctx, next) => {
          order.push('first-enter');
          await next();
          order.push('first-exit');
        })
        .use('second', async (ctx, next) => {
          order.push('second-enter');
          await next();
          order.push('second-exit');
        });

      await pipeline.execute(context);

      expect(order).toEqual([
        'first-enter',
        'second-enter',
        'second-exit',
        'first-exit',
      ]);
    });

    it('should pass context through middleware chain', async () => {
      pipeline
        .use('m1', async (ctx, next) => {
          ctx.state.m1 = true;
          await next();
        })
        .use('m2', async (ctx, next) => {
          ctx.state.m2 = true;
          await next();
        });

      await pipeline.execute(context);

      expect(context.state.m1).toBe(true);
      expect(context.state.m2).toBe(true);
    });

    it('should allow middleware to modify context', async () => {
      pipeline.use('modifier', async (ctx, next) => {
        ctx.locals.message = 'Hello';
        await next();
      });

      await pipeline.execute(context);

      expect(context.locals.message).toBe('Hello');
    });
  });

  describe('Error Handling', () => {
    it('should catch middleware errors with error boundary enabled', async () => {
      pipeline = new MiddlewarePipeline({ errorBoundary: true });

      pipeline.use('error', async () => {
        throw new Error('Middleware error');
      });

      // Should not throw, error should be caught
      await expect(pipeline.execute(context)).resolves.toBeUndefined();
      expect(context.error).toBeDefined();
      expect(context.statusCode).toBe(500);
    });

    it('should throw errors with error boundary disabled', async () => {
      pipeline = new MiddlewarePipeline({ errorBoundary: false });

      pipeline.use('error', async () => {
        throw new Error('Middleware error');
      });

      await expect(pipeline.execute(context)).rejects.toThrow(
        'Middleware error',
      );
    });

    it('should continue to next middleware after error', async () => {
      pipeline = new MiddlewarePipeline({ errorBoundary: true });
      const order: string[] = [];

      pipeline
        .use('error', async () => {
          order.push('error');
          throw new Error('Error in middleware');
        })
        .use('next', async (ctx, next) => {
          order.push('next');
          await next();
        });

      await pipeline.execute(context);

      expect(order).toContain('error');
    });
  });

  describe('Middleware Skip', () => {
    it('should allow middleware to skip next', async () => {
      const order: string[] = [];

      pipeline
        .use('first', async () => {
          order.push('first');
        })
        .use('second', async (ctx, next) => {
          order.push('second');
          await next();
        });

      await pipeline.execute(context);

      expect(order).toEqual(['first']);
      expect(order).not.toContain('second');
    });
  });

  describe('Clear Middlewares', () => {
    it('should clear all middlewares', () => {
      pipeline
        .use('m1', async (ctx, next) => await next())
        .use('m2', async (ctx, next) => await next());

      expect(pipeline.getMiddlewares().length).toBeGreaterThan(0);

      pipeline.clear();

      expect(pipeline.getMiddlewares().length).toBe(0);
    });
  });

  describe('Context State Management', () => {
    it('should maintain state across middleware', async () => {
      pipeline
        .use('setter', async (ctx, next) => {
          ctx.state.value = 42;
          await next();
        })
        .use('getter', async (ctx, next) => {
          ctx.state.value2 = (ctx.state.value as number) * 2;
          await next();
        });

      await pipeline.execute(context);

      expect(context.state.value).toBe(42);
      expect(context.state.value2).toBe(84);
    });

    it('should separate state and locals', async () => {
      pipeline.use('test', async (ctx, next) => {
        ctx.state.stateProp = 'state';
        ctx.locals.localProp = 'local';
        await next();
      });

      await pipeline.execute(context);

      expect(context.state.stateProp).toBe('state');
      expect(context.locals.localProp).toBe('local');
    });
  });
});
