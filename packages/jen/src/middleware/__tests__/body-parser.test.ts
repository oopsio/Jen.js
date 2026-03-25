/**
 * Body Parser Middleware Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test';
import { BodyParser, ContextBuilder } from '../index.js';
import type { MiddlewareContext } from '../index.js';

describe('BodyParser', () => {
  let parser: BodyParser;
  let context: MiddlewareContext;

  beforeEach(() => {
    parser = new BodyParser();
  });

  describe('JSON Parsing', () => {
    it('should parse JSON body', async () => {
      const body = JSON.stringify({ name: 'test', value: 123 });
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();
      let nextCalled = false;

      await middleware(context, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(context.body).toEqual({ name: 'test', value: 123 });
    });

    it('should handle empty JSON body', async () => {
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.body).toEqual({});
    });

    it('should throw on invalid JSON', async () => {
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json}',
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      try {
        await middleware(context, async () => {});
        expect.unreachable();
      } catch (error) {
        expect(String(error)).toContain('Invalid JSON');
      }
    });
  });

  describe('Form URL Encoded Parsing', () => {
    it('should parse form-urlencoded body', async () => {
      const body = 'name=test&value=123';
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.body).toEqual({ name: 'test', value: '123' });
    });
  });

  describe('Request Method Skipping', () => {
    it('should skip parsing for GET requests', async () => {
      const request = new Request('http://localhost/test', { method: 'GET' });
      context = ContextBuilder.build(request);
      const middleware = parser.middleware();
      let nextCalled = false;

      await middleware(context, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(context.body).toBeUndefined();
    });

    it('should skip parsing for HEAD requests', async () => {
      const request = new Request('http://localhost/test', { method: 'HEAD' });
      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.body).toBeUndefined();
    });

    it('should skip parsing for DELETE requests', async () => {
      const request = new Request('http://localhost/test', {
        method: 'DELETE',
      });
      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.body).toBeUndefined();
    });
  });

  describe('Size Limits', () => {
    it('should reject oversized payloads', async () => {
      const smallParser = new BodyParser({ maxSize: 100 });
      const body = 'x'.repeat(200);
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '200',
        },
        body,
      });

      context = ContextBuilder.build(request);
      const middleware = smallParser.middleware();

      try {
        await middleware(context, async () => {});
        expect.unreachable();
      } catch (error) {
        expect(String(error)).toContain('Payload too large');
      }
    });
  });

  describe('Content-Type Detection', () => {
    it('should detect content type', async () => {
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: '{}',
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.contentType).toContain('application/json');
    });

    it('should store raw body', async () => {
      const rawText = 'raw data';
      const request = new Request('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: rawText,
      });

      context = ContextBuilder.build(request);
      const middleware = parser.middleware();

      await middleware(context, async () => {});

      expect(context.rawBody).toBe(rawText);
    });
  });
});
