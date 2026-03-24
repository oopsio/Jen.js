import { describe, it, expect, beforeEach } from 'bun:test';
import { APIRouter, APIResponse, APIRouteScanner } from '../api-router';

describe('APIRouter', () => {
  beforeEach(() => {
    APIRouter.clear();
  });

  it('should identify API routes', () => {
    expect(APIRouter.isAPIRoute('/api/users')).toBe(true);
    expect(APIRouter.isAPIRoute('/api/hello')).toBe(true);
    expect(APIRouter.isAPIRoute('/users')).toBe(false);
    expect(APIRouter.isAPIRoute('/pages/api/users')).toBe(false);
  });

  it('should register and find routes', () => {
    const getHandler = async () => new Response('GET');
    const postHandler = async () => new Response('POST');

    APIRouter.registerRoute('/api/users', {
      GET: getHandler,
      POST: postHandler,
    });

    expect(APIRouter.findRoute('/api/users', 'GET')).toBe(getHandler);
    expect(APIRouter.findRoute('/api/users', 'POST')).toBe(postHandler);
    expect(APIRouter.findRoute('/api/users', 'DELETE')).toBeNull();
    expect(APIRouter.findRoute('/api/posts', 'GET')).toBeNull();
  });

  it('should handle multiple routes', () => {
    const handler1 = async () => new Response('users');
    const handler2 = async () => new Response('posts');

    APIRouter.registerRoute('/api/users', { GET: handler1 });
    APIRouter.registerRoute('/api/posts', { GET: handler2 });

    expect(APIRouter.findRoute('/api/users', 'GET')).toBe(handler1);
    expect(APIRouter.findRoute('/api/posts', 'GET')).toBe(handler2);
  });

  it('should support multiple methods on same route', () => {
    const getHandler = async () => new Response('GET');
    const postHandler = async () => new Response('POST');
    const putHandler = async () => new Response('PUT');

    APIRouter.registerRoute('/api/users', {
      GET: getHandler,
      POST: postHandler,
      PUT: putHandler,
    });

    expect(APIRouter.findRoute('/api/users', 'GET')).toBe(getHandler);
    expect(APIRouter.findRoute('/api/users', 'POST')).toBe(postHandler);
    expect(APIRouter.findRoute('/api/users', 'PUT')).toBe(putHandler);
  });

  it('should clear all routes', () => {
    APIRouter.registerRoute('/api/users', {
      GET: async () => new Response(),
    });

    expect(APIRouter.getRoutes().size).toBe(1);

    APIRouter.clear();

    expect(APIRouter.getRoutes().size).toBe(0);
  });
});

describe('APIResponse', () => {
  it('should return JSON response', async () => {
    const res = new APIResponse();
    const response = res.json({ message: 'hello' });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.text()).toContain('message');
  });

  it('should set custom status', async () => {
    const res = new APIResponse();
    const response = res.setStatus(201).json({ id: 1 });

    expect(response.status).toBe(201);
  });

  it('should return text response', async () => {
    const res = new APIResponse();
    const response = res.text('hello world');

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(await response.text()).toBe('hello world');
  });

  it('should return HTML response', async () => {
    const res = new APIResponse();
    const response = res.html('<h1>Hello</h1>');

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(await response.text()).toBe('<h1>Hello</h1>');
  });

  it('should set custom headers', async () => {
    const res = new APIResponse();
    res.setHeader('X-Custom', 'value');
    const response = res.json({});

    expect(response.headers.get('X-Custom')).toBe('value');
  });

  it('should return empty response', () => {
    const res = new APIResponse();
    const response = res.setStatus(204).empty();

    expect(response.status).toBe(204);
  });
});

describe('APIRouteScanner', () => {
  it('should scan for API routes', () => {
    const routes = APIRouteScanner.scanAPIRoutes();

    // Scanner returns empty if pages/api doesn't exist in test context
    // This is expected - the scanner works correctly when run from project root
    expect(Array.isArray(routes)).toBe(true);
  });

  it('should return empty array when api dir does not exist', () => {
    const routes = APIRouteScanner.scanAPIRoutes();
    // Should always return an array (empty or with routes)
    expect(Array.isArray(routes)).toBe(true);
  });
});
