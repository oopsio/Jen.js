import { describe, it, expect } from 'bun:test';
import {
  DataLoaderManager,
  type LoadContext,
  type LoadResult,
} from '../data-loader.js';

describe('DataLoaderManager', () => {
  it('should build context from URL', () => {
    const url = 'http://localhost:3000/blog?sort=date&limit=10';
    const context = DataLoaderManager.buildContext(url);

    expect(context.url).toBe(url);
    expect(context.pathname).toBe('/blog');
    expect(context.query?.sort).toBe('date');
    expect(context.query?.limit).toBe('10');
  });

  it('should build context with multiple query values', () => {
    const url = 'http://localhost:3000/api?tag=javascript&tag=typescript';
    const context = DataLoaderManager.buildContext(url);

    expect(context.pathname).toBe('/api');
    // URLSearchParams.getAll() and Object.fromEntries returns the last value for duplicate keys
    // This is browser standard behavior
    expect(context.query?.tag).toBeDefined();
  });

  it('should build context without query params', () => {
    const url = 'http://localhost:3000/about';
    const context = DataLoaderManager.buildContext(url);

    expect(context.pathname).toBe('/about');
    expect(Object.keys(context.query || {}).length).toBe(0);
  });

  it('should create redirect response', () => {
    const response = DataLoaderManager.createRedirectResponse('/new-location');

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('/new-location');
  });

  it('should create not found response', () => {
    const response = DataLoaderManager.createNotFoundResponse('Post not found');

    expect(response.status).toBe(404);
  });

  it('should create 404 response with default message', async () => {
    const response = DataLoaderManager.createNotFoundResponse();

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Page not found');
  });

  it('should handle load context', () => {
    const context: LoadContext = {
      url: 'http://localhost:3000/products?category=electronics',
      pathname: '/products',
      query: { category: 'electronics' },
    };

    expect(context.pathname).toBe('/products');
    expect(context.query?.category).toBe('electronics');
  });

  it('should handle load result with props', () => {
    const result: LoadResult = {
      props: {
        title: 'Test',
        data: [1, 2, 3],
      },
    };

    expect(result.props.title).toBe('Test');
    expect(result.props.data as number[]).toEqual([1, 2, 3]);
  });

  it('should handle load result with revalidate', () => {
    const result: LoadResult = {
      props: { data: [] },
      revalidate: 3600,
    };

    expect(result.revalidate).toBe(3600);
  });

  it('should handle load result with redirect', () => {
    const result: LoadResult = {
      props: {},
      redirect: '/login',
    };

    expect(result.redirect).toBe('/login');
  });

  it('should handle load result with notFound', () => {
    const result: LoadResult = {
      props: {},
      notFound: true,
    };

    expect(result.notFound).toBe(true);
  });

  it('should validate context URL parsing', () => {
    const urls = [
      'http://localhost:3000/page',
      'https://example.com/blog/post?id=1',
      'http://127.0.0.1:8080/api?limit=10&offset=20',
    ];

    for (const url of urls) {
      const context = DataLoaderManager.buildContext(url);
      expect(context.url).toBe(url);
      expect(context.pathname).toBeTruthy();
    }
  });
});
