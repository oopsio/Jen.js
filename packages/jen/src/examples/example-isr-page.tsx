/**
 * Example: ISR-enabled page in Jen.js
 *
 * Usage:
 * 1. Create pages/{slug}/app.tsx
 * 2. Add revalidate export to enable ISR
 * 3. Enable ISR in your app configuration
 *
 * File: pages/blog/[slug]/app.tsx
 */

/**
 * ISR Configuration:
 * - revalidate: Cache validity in seconds (60 = 1 minute, 3600 = 1 hour)
 * - isDynamic: Whether this is a dynamic/catch-all route
 *
 * When revalidate expires:
 * 1. User sees cached content immediately (fast)
 * 2. Page regenerates in background
 * 3. Next visitor sees fresh content
 */
export const revalidate = 3600; // 1 hour
export const isDynamic = true;

interface PageProps {
  slug?: string;
}

export default function BlogPage({ slug }: PageProps) {
  const generatedAt = new Date().toLocaleString();

  return (
    <html>
      <head>
        <title>Blog Post</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .cache-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            margin: 10px 0;
          }
          .cache-info {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
          }
        `}</style>
      </head>
      <body>
        <h1>Blog Post: {slug || 'untitled'}</h1>

        <div className="cache-badge">
          ISR Enabled - Revalidates every 1 hour
        </div>

        <article>
          <p>This page is cached and regenerated every 3600 seconds (1 hour).</p>
          <p>
            Generated at: <strong>{generatedAt}</strong>
          </p>

          <h2>How ISR Works</h2>
          <ol>
            <li>
              <strong>First request:</strong> Page renders on server and is
              cached
            </li>
            <li>
              <strong>Requests within 1 hour:</strong> Cached version returned
              instantly
            </li>
            <li>
              <strong>After 1 hour:</strong> Cached version still served, but
              regeneration starts in background
            </li>
            <li>
              <strong>Next visitor:</strong> Sees freshly regenerated content
            </li>
          </ol>

          <h2>Configuration</h2>
          <p>
            The <code>revalidate</code> export at the top of this file controls
            cache duration:
          </p>
          <pre>{`export const revalidate = 3600; // seconds`}</pre>

          <h2>Response Headers</h2>
          <p>
            Check the response headers to see ISR status:
          </p>
          <ul>
            <li>
              <code>X-Cache-Status</code>: MISS | HIT_FRESH | HIT_STALE
            </li>
            <li>
              <code>X-Cache-Age</code>: Age in seconds
            </li>
            <li>
              <code>Cache-Control</code>: Browser cache directives
            </li>
          </ul>
        </article>

        <div className="cache-info">
          <strong>💡 Tip:</strong> Use DevTools Network tab to see cache headers.
          F5 reload the page and notice the instant response with cache headers.
        </div>
      </body>
    </html>
  );
}

/**
 * Example configurations:
 *
 * Static page (never expires):
 * export const revalidate = undefined;
 *
 * Short lived cache (5 minutes):
 * export const revalidate = 300;
 *
 * Long lived cache (24 hours):
 * export const revalidate = 86400;
 *
 * Dynamic route parameter:
 * export const isDynamic = true;
 */
