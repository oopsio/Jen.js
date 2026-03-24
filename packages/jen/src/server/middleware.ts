/**
 * NextResponse utility for Edge Middleware.
 * Simplifies redirects, rewrites, and header manipulation.
 */
export class NextResponse extends Response {
  /**
   * Proceed to the next middleware or the main router.
   */
  public static next(init?: ResponseInit): Response {
    return new Response(null, {
      ...init,
      headers: {
        ...init?.headers,
        'x-jen-middleware': 'next',
      },
    });
  }

  /**
   * Redirect to a different URL.
   */
  public static redirect(url: string | URL, status: number = 307): Response {
    return new Response(null, {
      status,
      headers: {
        'Location': url.toString(),
      },
    });
  }

  /**
   * Rewrite the current request to a different URL (Internal).
   * Note: On many edge platforms, this involves returning a modified Request
   * or a special response header the platform understands.
   */
  public static rewrite(url: string | URL): Response {
    return new Response(null, {
      headers: {
        'x-jen-rewrite': url.toString(),
      },
    });
  }
}
