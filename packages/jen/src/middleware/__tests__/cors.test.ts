/**
 * CORS Middleware Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { CORS, ContextBuilder } from '../index';
import type { MiddlewareContext } from '../index';

describe('CORS', () => {
  let cors: CORS;
  let context: MiddlewareContext;

  beforeEach(() => {
    cors = new CORS({ origin: '*' });
    const request = new Request('http://localhost/test', { method: 'GET' });
    context = ContextBuilder.build(request);
  });

  describe('Origin Validation', () => {
    it('should allow wildcard origin', async () => {
      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Origin')).toBe(
        '*',
      );
    });

    it('should allow specific origin', async () => {
      cors = new CORS({ origin: 'https://example.com' });
      context.headers.set('origin', 'https://example.com');

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com',
      );
    });

    it('should allow multiple origins', async () => {
      cors = new CORS({
        origin: ['https://example.com', 'https://other.com'],
      });
      context.headers.set('origin', 'https://example.com');

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com',
      );
    });

    it('should allow dynamic origin validation', async () => {
      cors = new CORS({
        origin: (origin) => origin.endsWith('.example.com'),
      });
      context.headers.set('origin', 'https://sub.example.com');

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Origin')).toBe(
        'https://sub.example.com',
      );
    });
  });

  describe('Headers', () => {
    it('should set allowed methods', async () => {
      cors = new CORS({
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
      });

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT',
      );
    });

    it('should set allowed headers', async () => {
      cors = new CORS({
        origin: '*',
        allowedHeaders: ['Content-Type', 'Authorization'],
      });

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization',
      );
    });

    it('should set exposed headers', async () => {
      cors = new CORS({
        origin: '*',
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      });

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Expose-Headers')).toBe(
        'X-Total-Count, X-Page-Count',
      );
    });
  });

  describe('Credentials', () => {
    it('should set credentials header', async () => {
      cors = new CORS({
        origin: 'https://example.com',
        credentials: true,
      });
      context.headers.set('origin', 'https://example.com');

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(
        context.responseHeaders.get('Access-Control-Allow-Credentials'),
      ).toBe('true');
    });
  });

  describe('Max Age', () => {
    it('should set max age', async () => {
      cors = new CORS({
        origin: '*',
        maxAge: 3600,
      });

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.responseHeaders.get('Access-Control-Max-Age')).toBe(
        '3600',
      );
    });
  });

  describe('Preflight Requests', () => {
    it('should handle OPTIONS requests', async () => {
      const request = new Request('http://localhost/test', {
        method: 'OPTIONS',
      });
      context = ContextBuilder.build(request);

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      expect(context.statusCode).toBe(204);
      expect(context.response?.status).toBe(204);
    });

    it('should return no content for preflight', async () => {
      const request = new Request('http://localhost/test', {
        method: 'OPTIONS',
      });
      context = ContextBuilder.build(request);

      const middleware = cors.middleware();
      await middleware(context, async () => {});

      const body = await context.response!.text();
      expect(body).toBe('');
    });
  });
});
