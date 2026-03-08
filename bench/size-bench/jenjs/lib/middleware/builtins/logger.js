import { log } from "../../shared/log.js";
export async function logger(ctx, next) {
  const start = performance.now();
  // Log request
  const method = ctx.req.method;
  const url = ctx.url.pathname;
  const id = ctx.state.requestId ? `[${ctx.state.requestId}]` : "";
  log.info(`${id} -> ${method} ${url}`);
  try {
    await next();
  } finally {
    const ms = (performance.now() - start).toFixed(2);
    log.info(`${id} <- ${method} ${url} ${ctx.res.statusCode} (${ms}ms)`);
  }
}
