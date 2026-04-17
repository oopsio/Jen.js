import { MiddlewareContext } from './index.js';
import { executeAction } from '../core/actions.js';

/**
 * Server Actions Middleware
 * 
 * Intercepts POST requests to /api/__actions and executes the corresponding action.
 */
export class ActionsMiddleware {
  public static async handler(
    context: MiddlewareContext,
    next: () => Promise<void>
  ): Promise<void> {
    const { req, res } = context;
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/__actions' && req.method === 'POST') {
      try {
        // Assume bodyParser has already run and populated context.body
        // If not, we'll need to parse it ourselves.
        const body = (context as any).body || await req.json();
        const { id, args } = body;

        if (!id) {
          context.res = new Response(JSON.stringify({ success: false, error: 'Missing action ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
          return;
        }

        const result = await executeAction(id, args || []);
        
        context.res = new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });
        return;
      } catch (error) {
        context.res = new Response(JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
        return;
      }
    }

    await next();
  }
}
