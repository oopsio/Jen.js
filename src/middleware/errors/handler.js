import { HttpError } from "./http-error.js";
export async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    const status = err instanceof HttpError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    const details = err instanceof HttpError ? err.details : undefined;
    console.error(`Error processing request: ${message}`, err);
    // Check if response is already sent
    if (ctx.res.writableEnded) return;
    const accept = ctx.req.headers.accept || "";
    if (accept.includes("text/html")) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error ${status}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.5; }
                h1 { color: #e11d48; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
                pre { background: #f4f4f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            </style>
        </head>
        <body>
            <h1>Error ${status}</h1>
            <p><strong>${message}</strong></p>
            ${details ? `<details><summary>Details</summary><pre>${JSON.stringify(details, null, 2)}</pre></details>` : ""}
            <hr style="margin-top: 2rem; border: 0; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 0.875rem;">Jen.js Framework</p>
        </body>
        </html>
        `;
      ctx.response.status(status).html(html).send();
      return;
    }
    ctx.response.status(status).json({
      error: true,
      statusCode: status,
      message,
      details,
    });
    ctx.response.send();
  }
}
