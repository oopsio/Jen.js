import { describe, it, expect } from 'bun:test';
import { CacheRevalidationAPI, jen } from '../cache-revalidation.js';

describe('CacheRevalidationAPI', () => {
  it('should normalize paths correctly', async () => {
    const result = await CacheRevalidationAPI.revalidate('/blog/post/');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/blog/post');
  });

  it('should add leading slash if missing', async () => {
    const result = await CacheRevalidationAPI.revalidate('about');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/about');
  });

  it('should handle root path', async () => {
    const result = await CacheRevalidationAPI.revalidate('/');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/');
  });

  it('should return revalidation result with metadata', async () => {
    const result = await CacheRevalidationAPI.revalidate('/blog');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/blog');
    expect(result.message).toBeTruthy();
    expect(result.revalidatedAt).toBeTruthy();
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('should support recursive option', async () => {
    const result = await CacheRevalidationAPI.revalidate('/blog', {
      recursive: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('including children');
  });

  it('should handle revalidate without options', async () => {
    const result = await CacheRevalidationAPI.revalidate('/test');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/test');
  });

  it('should revalidate multiple paths', async () => {
    const paths = ['/blog/1', '/blog/2', '/blog/3'];
    const results = await CacheRevalidationAPI.revalidateMultiple(paths);

    expect(results.length).toBe(3);
    expect(results.every((r) => r.success)).toBe(true);
    expect(results.map((r) => r.path)).toEqual([
      '/blog/1',
      '/blog/2',
      '/blog/3',
    ]);
  });

  it('should revalidate pattern', async () => {
    const result = await CacheRevalidationAPI.revalidatePattern('/blog/*');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/blog/*');
  });

  it('should revalidate all', async () => {
    const result = await CacheRevalidationAPI.revalidateAll();

    expect(result.success).toBe(true);
    expect(result.path).toBe('*');
    expect(result.message.toLowerCase()).toContain('all');
  });

  it('should have timestamps in ISO format', async () => {
    const result = await CacheRevalidationAPI.revalidate('/test');

    expect(result.revalidatedAt).toBeTruthy();
    // Check if it's a valid ISO date
    expect(() => new Date(result.revalidatedAt)).not.toThrow();
  });

  it('jen.revalidate should work as shorthand', async () => {
    const result = await jen.revalidate('/test');

    expect(result.success).toBe(true);
    expect(result.path).toBe('/test');
  });

  it('jen.revalidate should pass through options', async () => {
    const result = await jen.revalidate('/blog', { recursive: true });

    expect(result.message).toContain('including children');
  });

  it('jen.revalidateMultiple should work', async () => {
    const results = await jen.revalidateMultiple(['/a', '/b']);

    expect(results.length).toBe(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('jen.revalidatePattern should work', async () => {
    const result = await jen.revalidatePattern('/api/*');

    expect(result.success).toBe(true);
  });

  it('jen.revalidateAll should work', async () => {
    const result = await jen.revalidateAll();

    expect(result.success).toBe(true);
    expect(result.path).toBe('*');
  });

  it('should measure duration correctly', async () => {
    const result = await CacheRevalidationAPI.revalidate('/test');

    expect(typeof result.duration).toBe('number');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle complex paths', async () => {
    const paths = [
      '/blog/2025/03/post-title',
      '/api/v1/users/profile',
      '/shop/category/products',
    ];

    const results = await CacheRevalidationAPI.revalidateMultiple(paths);

    expect(results.length).toBe(3);
    expect(results.every((r) => r.success)).toBe(true);
  });
});
